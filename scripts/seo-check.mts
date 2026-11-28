import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import type { Ranking } from "../src/lib/types.ts";

// Check actual responses with JavaScript disabled: only received HTML is inspected.
const base = (process.argv[2] || "http://localhost:3200").replace(/\/$/, "");
const canonicalBase = (process.env.NEXT_PUBLIC_SITE_URL || "https://allranks.world").replace(/\/+$/, "");
const results: { path: string; status: number; bytes: number; milliseconds: number }[] = [];
async function get(path: string, status = 200) {
  const start = performance.now();
  const response = await fetch(`${base}${path}`, { redirect: "manual", signal: AbortSignal.timeout(60000) });
  const html = await response.text();
  results.push({ path, status: response.status, bytes: Buffer.byteLength(html), milliseconds: Math.round(performance.now() - start) });
  assert.equal(response.status, status, path);
  if (status === 200) assert(!/noindex/i.test(response.headers.get("x-robots-tag") || ""), `${path}: header noindex`);
  return html;
}
function canonical(html: string, path: string) {
  const head = html.split("</head>", 1)[0];
  const matches = [...head.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
  assert.equal(matches.length, 1, `${path}: one head canonical`);
  const actual = matches[0][1].replace(/&amp;/g, "&");
  assert.equal(new URL(actual).href, new URL(`${canonicalBase}${path}`).href, `${path}: canonical`);
  assert.match(head, /<title>[^<]+<\/title>/, path);
  assert.match(head, /<meta name="description" content="[^"]+"/, path);
  assert.match(head, /<meta property="og:title" content="[^"]+"/, path);
  assert.match(head, /<meta name="twitter:card" content="summary_large_image"/, path);
  assert.match(html, /<html lang="en"/, path);
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.equal([...body.matchAll(/<h1[\s>]/g)].length, 1, `${path}: one H1`);
  if (!path.startsWith("/search")) assert.match(head, /<meta name="robots" content="index, follow"/, path);
}
function structured(html: string, type: string) {
  const data = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
  const node = data.flatMap((entry) => entry["@graph"] ?? [entry]).find((entry) => entry["@type"] === type);
  assert(node, `Missing ${type}`);
  return node;
}
const home = await get("/"); canonical(home, "/"); structured(home, "Organization"); structured(home, "WebSite");
assert(home.includes("<title>World rankings – AllRanks</title>"), "Home title includes the brand once");
assert(home.includes('href="#main-content"'));
assert(home.includes("Browse country rankings by name"));
assert(home.includes('property="og:image"'), "Home OG image");
assert(home.includes('type="application/rss+xml"'), "RSS discovery link");
const feedResponse = await fetch(`${base}/feed.xml`, { signal: AbortSignal.timeout(60000) });
assert.equal(feedResponse.status, 200);
assert(feedResponse.headers.get("content-type")?.startsWith("application/rss+xml"));
const feed = await feedResponse.text();
assert(feed.includes('<rss version="2.0"'));
assert.equal([...feed.matchAll(/<item>/g)].length, 50, "Recent public snapshots");
assert(!feed.includes("Invalid Date"));
const robots = await get("/robots.txt"); assert(!robots.includes("Disallow: /search"));
assert(robots.includes(`Sitemap: ${canonicalBase}/sitemap.xml`));
const llms = await get("/llms.txt");
assert(llms.includes("not the original author") && llms.includes(`${canonicalBase}/editorial-policy`));
const search = await get("/search?q=india"); canonical(search, "/search?q=india");
assert(search.includes('content="noindex, follow"'), "Internal search excluded from indexing");
assert(search.includes("Search: india"), "Query-specific title");
const source: Ranking = JSON.parse(readFileSync("data/rankings/wbx-lp-lpi-trac-rk.json", "utf8"));
const ranking = await get(`/ranking/${source.id}`); canonical(ranking, `/ranking/${source.id}`);
const dataset = structured(ranking, "Dataset");
assert.equal(dataset.license, "https://creativecommons.org/licenses/by/4.0/");
assert.equal(dataset.citation, source.source.url);
assert.equal(dataset.mainEntityOfPage["@id"], structured(ranking, "WebPage")["@id"]);
assert.equal(dataset.dateModified, undefined, "Fetch time is not a publication modification");
structured(ranking, "BreadcrumbList");
assert.match(ranking, /<nav class="crumbs" aria-label="Breadcrumb"/);
assert(ranking.includes(`<time dateTime="${source.updatedAt}"`));
assert.equal(structured(ranking, "Article").author["@id"], structured(home, "Organization")["@id"]);
const table = ranking.match(/<table class="table ranking-data-table">(.*?)<\/table>/s)?.[1] || "";
assert.equal([...table.matchAll(/<tr class="row"/g)].length, source.items.length, "Every ranking row in HTML");
assert(!ranking.includes("times lower") && !ranking.includes("times the value"), "No ordinal ratio comparison");
const desc = ranking.match(/<meta name="description" content="(.*?)"/s)?.[1] || "";
assert(desc.length > 0 && desc.length < 260, "Compact description (including HTML entities)");
for (const [path, country] of [["/ranking/ae-airports-by-elevation", "United Arab Emirates"], ["/ranking/af-airports-by-elevation", "Afghanistan"]]) {
  const html = await get(path);
  canonical(html, path);
  assert.match(html, new RegExp(`<title>Highest Airports in ${country} \\(2026\\)`));
  assert(html.includes(`name="description" content="Highest Airports in ${country}.`));
}
for (const path of ["/country/IN", "/country/IN?page=2", "/category/economy", "/category/economy?page=2"]) {
  const html = await get(path); canonical(html, path);
  assert.equal(structured(html, "BreadcrumbList").itemListElement.at(-1).item, `${canonicalBase}${path}`);
  assert(html.includes(path.startsWith("/country") ? "/country/IN?page=" : "/category/economy?page="), "Crawlable pagination");
  if (path.endsWith("?page=2")) assert(/<meta name="description" content="[^"]*page 2 of /.test(html), `${path}: distinct pagination description`);
}
for (const path of ["/about", "/methodology", "/privacy", "/latest", "/popular", "/editorial-policy", "/guides", "/columns"]) canonical(await get(path), path);
structured(await get("/about"), "AboutPage");
const sitemap = await get("/sitemap.xml");
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapPaths = new Set(locations.map((url) => {
  assert.equal(new URL(url).origin, canonicalBase);
  assert(!new URL(url).search && !new URL(url).hash, url);
  return new URL(url).pathname;
}));
assert.equal(sitemapPaths.size, locations.length, "Unique sitemap URLs");
for (const path of ["/", "/latest", "/columns", "/guides"]) assert(sitemapPaths.has(path));
assert(!sitemapPaths.has("/search") && ![...sitemapPaths].some((path) => path.startsWith("/api/")));
for (const [, date] of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
  assert(Number.isFinite(Date.parse(date)) && Date.parse(date) <= Date.now(), `Sitemap lastmod: ${date}`);
}
assert(sitemap.includes("<lastmod>"));
for (const path of sitemapPaths) {
  if (!/^\/(guides|columns)\//.test(path)) continue;
  const html = await get(path);
  canonical(html, path);
  const article = structured(html, "Article");
  assert.equal(article.mainEntityOfPage["@id"], structured(html, "WebPage")["@id"]);
  assert(article.citation.length > 0);
}
for (const [path, location] of [
  ["/category/economy?page=1", "/category/economy"],
  ["/country/IN?page=1", "/country/IN"],
  ["/country/in?page=1&utm_source=check", "/country/IN?utm_source=check"],
  ["/country/in?page=2", "/country/IN?page=2"],
]) {
  const response = await fetch(base + path, { redirect: "manual", signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 308, path);
  assert.equal(new URL(response.headers.get("location")!, base).href, base + location, path);
  await response.body?.cancel();
  canonical(await get(location), location.split("?utm_source")[0]);
}
for (const path of ["/country/ZZ", "/ranking/seo-check-nonexistent", "/columns/seo-check-nonexistent",
  "/country/IN?page=99999", "/category/economy?page=99999", "/country/IN?page=0", "/category/economy?page=2&page=3"]) {
  await get(path, 404);
}
const api = await fetch(`${base}/api/search-suggestions?q=india`, { signal: AbortSignal.timeout(60000) });
assert.equal(api.status, 200);
assert.equal(api.headers.get("x-robots-tag"), "noindex");
await api.body?.cancel();

// Traverse listing links from the home HTML. Check pagination to the end for
// every category and the first page of every country (including regional links).
const discovered = new Set(["/"]);
const pending: string[] = [];
function discover(html: string) {
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  for (const [, href] of body.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const url = new URL(href.replace(/&amp;/g, "&"), canonicalBase);
    if (url.origin !== canonicalBase) continue;
    if (!/^\/(ranking|country|category|guides|columns)(\/[^/]+)?$/.test(url.pathname) && !sitemapPaths.has(url.pathname)) continue;
    if (url.pathname.startsWith("/ranking/")) assert(sitemapPaths.has(url.pathname), `Broken or unlisted ranking link: ${href}`);
    const path = url.pathname.startsWith("/category/") ? url.pathname + url.search : url.pathname;
    if (discovered.has(path)) continue;
    discovered.add(path);
    if (/^\/(category|country)\//.test(path) || ["/columns", "/guides", "/latest", "/popular"].includes(path)) pending.push(path);
  }
}
discover(home);
while (pending.length) {
  await Promise.all(pending.splice(0, 8).map(async (path) => {
    const html = await get(path);
    canonical(html, path);
    discover(html);
  }));
}
const orphaned = [...sitemapPaths].filter((path) => !discovered.has(path));
assert.equal(orphaned.length, 0, `Sitemap URLs without a link from browsable listings: ${orphaned.slice(0, 20).join(", ")}`);
if (process.env.SEO_CHECK_ALL === "1") {
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  const pages = [...sitemapPaths];
  while (pages.length) {
    await Promise.all(pages.splice(0, 8).map(async (path) => {
      const html = await get(path);
      canonical(html, path);
      const head = html.split("</head>", 1)[0];
      const title = head.match(/<title>([^<]+)<\/title>/)![1];
      const description = head.match(/<meta name="description" content="([^"]+)"/)![1];
      assert(!titles.has(title), `Duplicate title: ${path} and ${titles.get(title)}`);
      assert(!descriptions.has(description), `Duplicate description: ${path} and ${descriptions.get(description)}`);
      titles.set(title, path);
      descriptions.set(description, path);
    }));
  }
}
const unpublished = readdirSync("data/rankings").filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(`data/rankings/${f}`, "utf8")) as Ranking).filter((r) => r.source.verified === false || (["manual", "agent"].includes(r.source.kind) && r.source.verified !== true));
for (const r of unpublished) {
  assert(!feed.includes(`${canonicalBase}/ranking/${r.id}</link>`), `Private feed entry: ${r.id}`);
  assert(!sitemap.includes(`/ranking/${r.id}</loc>`), `Private sitemap entry: ${r.id}`);
  await get(`/ranking/${r.id}`, 404);
}
await get("/seo-check-nonexistent", 404);
const image = await fetch(`${base}/share-image`, { signal: AbortSignal.timeout(60000) }); assert.equal(image.status, 200); assert(image.headers.get("content-type")?.startsWith("image/png"));
const report = { base, checkedAt: new Date().toISOString(), sitemapUrls: sitemapPaths.size, orphaned, unpublishedChecked: unpublished.length, results };
console.log(JSON.stringify(report, null, 2));
if (process.argv[3]) writeFileSync(process.argv[3], `${JSON.stringify(report, null, 2)}\n`);

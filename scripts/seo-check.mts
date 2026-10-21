import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import type { Ranking } from "../src/lib/types.ts";

// Check actual responses with JavaScript disabled: only received HTML is inspected.
const base = (process.argv[2] || "http://localhost:3200").replace(/\/$/, "");
const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || "https://allranks.world";
const results: { path: string; status: number; bytes: number; milliseconds: number }[] = [];
async function get(path: string, status = 200) {
  const start = performance.now();
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(60000) });
  const html = await response.text();
  results.push({ path, status: response.status, bytes: Buffer.byteLength(html), milliseconds: Math.round(performance.now() - start) });
  assert.equal(response.status, status, path);
  if (status === 200) assert(!/noindex/i.test(response.headers.get("x-robots-tag") || ""), `${path}: header noindex`);
  return html;
}
function canonical(html: string, path: string) {
  const actual = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]?.replace(/&amp;/g, "&");
  assert(actual && new URL(actual).href === new URL(`${canonicalBase}${path}`).href, `${path}: canonical (${actual})`);
}
function structured(html: string, type: string) {
  const data = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
  assert(data.some((node) => node["@type"] === type || node["@graph"]?.some((child: Record<string, unknown>) => child["@type"] === type)), `Missing ${type}`);
}
const home = await get("/"); canonical(home, "/"); structured(home, "Organization"); structured(home, "WebSite");
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
assert((await get("/llms.txt")).includes("not the original author"));
const search = await get("/search?q=india"); canonical(search, "/search?q=india");
assert(search.includes('content="index, follow"'), "Search indexable");
assert(search.includes("Search: india"), "Query-specific title");
const source: Ranking = JSON.parse(readFileSync("data/rankings/wbx-lp-lpi-trac-rk.json", "utf8"));
const ranking = await get(`/ranking/${source.id}`); canonical(ranking, `/ranking/${source.id}`);
structured(ranking, "Dataset"); structured(ranking, "BreadcrumbList");
const table = ranking.match(/<table class="table ranking-data-table">(.*?)<\/table>/s)?.[1] || "";
assert.equal([...table.matchAll(/<tr class="row"/g)].length, source.items.length, "Every ranking row in HTML");
assert(!ranking.includes("times lower") && !ranking.includes("times the value"), "No ordinal ratio comparison");
const desc = ranking.match(/<meta name="description" content="(.*?)"/s)?.[1] || "";
assert(desc.length > 0 && desc.length < 260, "Compact description (including HTML entities)");
for (const path of ["/country/IN", "/country/IN?page=2", "/category/economy", "/category/economy?page=2"]) {
  const html = await get(path); canonical(html, path); structured(html, "BreadcrumbList");
  assert(html.includes(path.startsWith("/country") ? "/country/IN?page=" : "/category/economy?page="), "Crawlable pagination");
}
for (const path of ["/about", "/methodology", "/privacy", "/latest", "/popular"]) canonical(await get(path), path);
const sitemap = await get("/sitemap.xml"); assert(sitemap.includes(`${canonicalBase}/latest</loc>`)); assert(sitemap.includes("<lastmod>"));
const unpublished = readdirSync("data/rankings").filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(`data/rankings/${f}`, "utf8")) as Ranking).filter((r) => r.source.verified === false || (["manual", "agent"].includes(r.source.kind) && r.source.verified !== true));
for (const r of unpublished) {
  assert(!feed.includes(`${canonicalBase}/ranking/${r.id}</link>`), `Private feed entry: ${r.id}`);
  assert(!sitemap.includes(`/ranking/${r.id}</loc>`), `Private sitemap entry: ${r.id}`);
  await get(`/ranking/${r.id}`, 404);
}
await get("/seo-check-nonexistent", 404);
const image = await fetch(`${base}/share-image`, { signal: AbortSignal.timeout(60000) }); assert.equal(image.status, 200); assert(image.headers.get("content-type")?.startsWith("image/png"));
console.log(JSON.stringify({ base, checkedAt: new Date().toISOString(), unpublishedChecked: unpublished.length, results }, null, 2));
if (process.argv[3]) writeFileSync(process.argv[3], `${JSON.stringify({ base, checkedAt: new Date().toISOString(), unpublishedChecked: unpublished.length, results }, null, 2)}\n`);

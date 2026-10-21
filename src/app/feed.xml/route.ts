import { allRankings } from "@/lib/data";
import { getCategory } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";
import snapshots from "../../../data/seo-snapshots.json";

export const dynamic = "force-static";

const xml = (value: string) => value
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export function GET() {
  const observed: Record<string, { hash: string; lastModified: string }> = snapshots;
  // Use the same public gate as the website. Fetch-only changes do not create new entries.
  const entries = allRankings().flatMap((ranking) => {
    const snapshot = observed[ranking.id];
    return snapshot && Number.isFinite(Date.parse(snapshot.lastModified)) ? [{ ranking, snapshot }] : [];
  }).sort((a, b) => b.snapshot.lastModified.localeCompare(a.snapshot.lastModified) || a.ranking.id.localeCompare(b.ranking.id)).slice(0, 50);
  const items = entries.map(({ ranking: r, snapshot }) => {
    const url = `${SITE_URL}/ranking/${encodeURIComponent(r.id)}`;
    const description = `${r.desc}\nReference period: ${r.asOf ?? r.year}.${r.editionYear ? ` Edition: ${r.editionYear}.` : ""}\nSource: ${r.source.name}${r.source.url ? ` (${r.source.url})` : ""}.\nSnapshot content observed: ${snapshot.lastModified}. This is not the original source publication date.`;
    return `    <item>
      <title>${xml(r.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="false">${xml(`${url}#snapshot-${snapshot.hash}`)}</guid>
      <description>${xml(description)}</description>
      <category>${xml(getCategory(r.category)?.name ?? r.category)}</category>
      <pubDate>${new Date(snapshot.lastModified).toUTCString()}</pubDate>
    </item>`;
  }).join("\n");
  const updated = entries[0]?.snapshot.lastModified;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AllRanks — Ranking updates</title>
    <link>${xml(SITE_URL)}</link>
    <description>The 50 most recently observed public ranking snapshots on AllRanks. Dates track observed content changes, not original source publication. Initial entries share the first observation date.</description>
    <language>en</language>
    <atom:link href="${xml(`${SITE_URL}/feed.xml`)}" rel="self" type="application/rss+xml" />
    ${updated ? `<lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>` : ""}
    <ttl>60</ttl>
${items}
  </channel>
</rss>\n`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
}

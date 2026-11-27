import { columnDate, columnPath, publishedColumns } from "@/lib/columns";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const xml = (value: string) => value
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export function GET() {
  const items = publishedColumns().slice(0, 50).map((column) => {
    const url = xml(`${SITE_URL}${columnPath(column.id)}`);
    return `    <item>
      <title>${xml(column.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${xml(column.summary)}</description>
      <pubDate>${columnDate(column.publishedOn).toUTCString()}</pubDate>
    </item>`;
  }).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AllRanks — Columns</title>
    <link>${xml(`${SITE_URL}/columns`)}</link>
    <description>Source-backed analysis of recent rankings.</description>
    <language>en</language>
    <atom:link href="${xml(`${SITE_URL}/columns/feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
}

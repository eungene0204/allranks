import { SITE_URL } from "@/lib/site";

/** Optional navigation for tools that consume llms.txt; not a Google ranking signal. */
export function GET() {
  return new Response(`# AllRanks

> A source-linked collection of world and country rankings.

## Explore
- [Home](${SITE_URL}/): Browse countries and ranking topics.
- [Latest rankings](${SITE_URL}/latest): Latest available publication years.
- [Popular rankings](${SITE_URL}/popular): Selected topics.
- [Methodology](${SITE_URL}/methodology): Collection, verification and limitations.
- [About](${SITE_URL}/about): Purpose and contact details.
- [RSS feed](${SITE_URL}/feed.xml): Recently observed public ranking snapshots.
- [Sitemap](${SITE_URL}/sitemap.xml): Public ranking, country and category URLs.

## Attribution and dates
AllRanks aggregates external sources; it is not the original author of their statistics.
Each ranking links to its source and states its reference period and update date.
Cite the specific ranking page and its original source. Reference periods can differ between rankings.
Manually and AI-collected lists require source verification before publication.
`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { allRankings } from "@/lib/data";

export const metadata: Metadata = pageMetadata('Methodology', 'How AllRanks collects, refreshes and checks its ranking data.', '/methodology');

export default function MethodologyPage() {
  const all = allRankings();
  const bySource = new Map<string, { name: string; url?: string; license?: string; count: number }>();
  for (const r of all) {
    const host = r.source.url ? new URL(r.source.url).hostname : undefined;
    const key = `${host ?? r.source.name}|${r.source.license ?? ""}`;
    const cur = bySource.get(key) ?? { name: host ?? r.source.name, url: host ? `https://${host}` : undefined, license: r.source.license, count: 0 };
    cur.count++;
    bySource.set(key, cur);
  }
  const sources = [...bySource.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const ai = all.filter((r) => r.source.kind === "agent").length;

  return (
    <>
      <div className="page-head">
        <h1>Methodology</h1>
        <p>How the numbers get here, and how much to trust them.</p>
      </div>
      <div className="prose">
        <h2>1. Open sources only</h2>
        <p>
          Rankings link to their public source. Where the publisher provides a reuse licence, we display it with the collection date.
          Public access does not by itself establish reuse permission; a missing licence field is not a grant of rights. Check the original publisher’s terms before reusing material.
        </p>

        <h2>2. Automatic collection</h2>
        <p>
          Many rankings are filled by small programs that download the numbers from an official data service (for example the World Bank
          API) or read a published table. Some lists are curated from published source material. The World Bank collector uses one reference year per ranking: the newest year with at least 10 matched country observations. This avoids mixing years but can leave substantial gaps. Other sources, including GeoNames population records and cumulative research metrics, may combine observations from different periods; their snapshot year is not a claim that all underlying events happened that year.
        </p>

        <h2>3. Checks before publishing</h2>
        <ul>
          <li>Country names are matched to ISO country codes; anything we cannot match is reported instead of guessed.</li>
          <li>Where a source publishes a world total, we compare it with the sum of the rows.</li>
          <li>A refresh that loses many rows or returns too few is rejected, and the previous version stays online.</li>
          <li>The freshness report lists reference years more than one year behind the current year by default. This is a review aid, not a guarantee of review within a fixed number of days.</li>
        </ul>

        <h2>4. AI-collected rankings</h2>
        <p>
          {ai > 0 ? `${ai} ranking${ai > 1 ? "s were" : " was"}` : "Some rankings may be"} gathered by an AI research agent that reads web pages when no downloadable dataset exists.
          Manually and AI-collected lists stay private until the AllRanks assistant compares their entries, order, units and edition with the linked sources and records verification. Format checks alone do not authorize publication. Source-specific recommendations are identified when they are not directly comparable.
        </p>

        <h2>5. Limits</h2>
        <p>
          Definitions and methods differ between countries, many figures are estimates, and the latest available year is not the same everywhere.
          Several rankings (for example AI supercomputers) are census-style counts that miss what is not public, so they are lower bounds.
        </p>

        <h2>6. Calculations and explanations</h2>
        <p>The two-entry comparison subtracts the stored values from the same snapshot before rounding. Percentage-valued measures use percentage points for the absolute gap. Table positions follow the selected direction, with equal stored values ordered by name; they are not statistical significance tests. Calculated summaries are labeled separately from publisher observations.</p>
        <p>Our <Link href="/guides">reading guides</Link> explain the questions a measure can answer, its limitations and related comparisons. Read our <Link href="/editorial-policy">editorial policy</Link> for AI assistance, source checking and corrections.</p>

        <h2>Source publishers</h2>
        <p>Grouped by source website and licence. Each ranking links to its specific original source.</p>
        <table className="plain">
          <thead>
            <tr><th>Source</th><th>Licence</th><th>Rankings</th></tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={`${s.name}|${s.license ?? ""}`}>
                <td>{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a> : s.name}</td>
                <td>{s.license ?? "—"}</td>
                <td>{s.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

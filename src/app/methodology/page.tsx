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
          Every ranking comes from a public source that allows reuse. The source name, a link, the licence and the date we fetched the data
          appear under each ranking.
        </p>

        <h2>2. Automatic collection</h2>
        <p>
          Most rankings are filled by small programs that download the numbers from an official data service (for example the World Bank
          API) or read a published table. Some lists are curated from published source material. The programs use one reference year per ranking, so every row of a
          list is from the same period.
        </p>

        <h2>3. Checks before publishing</h2>
        <ul>
          <li>Country names are matched to ISO country codes; anything we cannot match is reported instead of guessed.</li>
          <li>Where a source publishes a world total, we compare it with the sum of the rows.</li>
          <li>A refresh that loses many rows or returns too few is rejected, and the previous version stays online.</li>
          <li>Rankings with data older than 120 days are flagged for review.</li>
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

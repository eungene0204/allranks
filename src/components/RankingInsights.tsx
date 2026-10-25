import { countryInfo } from "@/lib/data";
import { rankingInsights } from "@/lib/insights";
import type { Ranking } from "@/lib/types";

/** "Highlights" under a ranking table: sentences computed from the table's own numbers. */
export default function RankingInsights({ ranking }: { ranking: Ranking }) {
  const lines = rankingInsights(ranking, countryInfo);
  if (!lines.length) return null;
  return (
    <section className="insights" aria-labelledby="insights-h">
      <h2 id="insights-h">Calculated from this table</h2>
      <p className="comparison-note">AllRanks calculations from the listed observations. These summaries do not establish the causes behind a difference.</p>
      {lines.map((l, i) => (
        <p key={i}>{l}</p>
      ))}
    </section>
  );
}

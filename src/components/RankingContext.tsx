import Link from "next/link";
import { countryInfo } from "@/lib/data";
import { formatValue } from "@/lib/format";
import type { Ranking } from "@/lib/types";

const MONTH = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const DAY = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

/** Dataset context stays visible directly before the chart and ranking table. */
export default function RankingContext({ ranking: r }: { ranking: Ranking }) {
  const urls = [...new Set([r.source.url, ...(r.source.urls ?? [])].filter((url): url is string => Boolean(url)))];
  const period = r.asOf ? MONTH.format(new Date(`${r.asOf}-01T00:00:00Z`)) : String(r.year);
  const scope = r.scope ? countryInfo(r.scope)?.name ?? r.scope : "Worldwide";
  const countryCount = new Set(r.items.map((item) => item.country)).size;
  const range = r.items.reduce(({ min, max }, item) => ({
    min: Math.min(min, item.value), max: Math.max(max, item.value),
  }), { min: Infinity, max: -Infinity });

  return (
    <section className="ranking-context" aria-labelledby="ranking-context-title">
      <h2 id="ranking-context-title">About this ranking</h2>
      <dl className="ranking-context-grid">
        <div>
          <dt>Source</dt>
          <dd>
            {urls[0] ? <a href={urls[0]} target="_blank" rel="noopener noreferrer">{r.source.name} ↗</a> : r.source.name}
            {urls.length > 1 && (
              <span className="ranking-context-links">
                {urls.slice(1).map((url, i) => <a key={url} href={url} target="_blank" rel="noopener noreferrer">Reference {i + 2} ↗</a>)}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>Reference period</dt>
          <dd>{period}<span className="ranking-context-secondary">Dataset updated {DAY.format(new Date(r.updatedAt))}</span></dd>
        </div>
        <div className="ranking-context-definition">
          <dt>Definition</dt>
          <dd>{r.desc || "Not specified in this dataset. Consult the original source."}</dd>
        </div>
        <div>
          <dt>Unit</dt>
          <dd>{r.unit || "Not specified in this dataset"}</dd>
        </div>
        <div>
          <dt>Coverage &amp; value range</dt>
          <dd>
            {scope} · {r.items.length.toLocaleString("en-US")} listed {r.scope || r.multi ? "entries" : "countries and territories"}
            {r.multi && !r.scope && <span className="ranking-context-secondary">Across {countryCount} country/territory labels</span>}
            {r.items.length > 0 && <span className="ranking-context-secondary">Values: {formatValue(r, range.min)} to {formatValue(r, range.max)}</span>}
          </dd>
        </div>
        <div>
          <dt>Ranking direction</dt>
          <dd>{r.order === "asc" ? "Lowest value first (ascending)" : "Highest value first (descending)"}<span className="ranking-context-secondary">#1 is the {r.order === "asc" ? "lowest" : "highest"} listed value, not necessarily the best outcome.</span></dd>
        </div>
      </dl>
      {r.source.note && <p className="ranking-context-note"><strong>Source notes:</strong> {r.source.note}</p>}
      <p className="ranking-context-footnote">Coverage describes this list, not necessarily the full population. Missing entries do not imply a value of zero. <Link href="/methodology">Collection &amp; methodology →</Link></p>
    </section>
  );
}

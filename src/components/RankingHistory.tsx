"use client";

import { useEffect, useState } from "react";
import { formatValue } from "@/lib/format";
import type { HistoryPoint, RankingHistory as HistoryResponse } from "@/lib/ranking-history";
import type { Ranking } from "@/lib/types";

type Props = {
  id: string;
  title: string;
  order: Ranking["order"];
  format: Pick<Ranking, "prefix" | "suffix" | "decimals" | "unit">;
  defaultCountry: string;
  countries: { code: string; name: string }[];
};

export default function RankingHistory({ id, title, order, format, defaultCountry, countries }: Props) {
  const [country, setCountry] = useState(defaultCountry);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!country) return;
    const controller = new AbortController();
    setStatus("loading");
    fetch(`/api/ranking-history/${encodeURIComponent(id)}?country=${encodeURIComponent(country)}`, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Unavailable"); return response.json() as Promise<HistoryResponse>; })
      .then((data) => { setHistory(data); setStatus("ready"); })
      .catch(() => { if (!controller.signal.aborted) { setHistory(null); setStatus("error"); } });
    return () => controller.abort();
  }, [id, country]);

  const points = history?.points ?? [];
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const chartPoints = points.map((point, index) => ({
    ...point,
    x: 3 + (index / Math.max(points.length - 1, 1)) * 94,
    y: 92 - ((point.value - min) / span) * 84,
  }));
  const selectedName = countries.find((entry) => entry.code === country)?.name ?? country;

  return (
    <section className="ranking-history" aria-labelledby="ranking-history-title">
      <div className="ranking-history-heading">
        <div><h2 id="ranking-history-title">Year-by-year change</h2><p>Compare values and rank for the same indicator in the source’s annual series.</p></div>
        <label>Country or territory <select value={country} onChange={(event) => setCountry(event.target.value)}>{countries.map((entry) => <option key={entry.code} value={entry.code}>{entry.name}</option>)}</select></label>
      </div>
      {status === "loading" && <p className="ranking-history-status" role="status">Loading annual data…</p>}
      {status === "error" && <p className="ranking-history-status" role="status">Annual data is unavailable for this selection. Check the source for earlier observations.</p>}
      {status === "ready" && points.length < 2 && <p className="ranking-history-status">The source has fewer than two comparable years for {selectedName}.</p>}
      {status === "ready" && points.length >= 2 && (
        <>
          <div className="ranking-history-chart" role="img" aria-label={`${title}: value for ${selectedName} from ${points[0].year} to ${points.at(-1)!.year}`}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline points={chartPoints.map((point) => `${point.x},${point.y}`).join(" ")} />
              {chartPoints.map((point) => <circle key={point.year} cx={point.x} cy={point.y} r="1" />)}
            </svg>
            <div className="ranking-history-chart-labels"><span>{points[0].year}</span><span>{points.at(-1)!.year}</span></div>
          </div>
          <div className="ranking-history-scroll"><table>
            <thead><tr><th scope="col">Year</th><th scope="col">Value</th><th scope="col">Rank</th><th scope="col">Change from prior year</th></tr></thead>
            <tbody>{points.map((point, index) => {
              const previous: HistoryPoint | undefined = points[index - 1];
              const contiguous = previous && point.year === previous.year + 1;
              const rankChange = contiguous ? previous.rank - point.rank : 0;
              return <tr key={point.year}>
                <th scope="row">{point.year}</th>
                <td>{formatValue(format, point.value)}</td>
                <td>#{point.rank} of {point.count}</td>
                <td>{contiguous ? `${rankChange > 0 ? "↑ " : rankChange < 0 ? "↓ " : "→ "}${Math.abs(rankChange)} places` : "—"}</td>
              </tr>;
            })}</tbody>
          </table></div>
          <p className="ranking-history-note">Line = value; rank compares countries with data in each year ({order === "asc" ? "lower" : "higher"} values rank first). Rank changes are shown only for consecutive years. Source values can be revised after this ranking’s snapshot{history?.revised ? "; the saved snapshot differs from the live series" : ""}. <a href={history!.source} target="_blank" rel="noopener noreferrer">Annual source data ↗</a></p>
        </>
      )}
    </section>
  );
}

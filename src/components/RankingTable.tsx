"use client";

import { useMemo, useState } from "react";
import { formatValue, ranked } from "@/lib/format";
import type { Ranking } from "@/lib/types";
import Mark from "./Mark";
import RankBadge from "./RankBadge";

const LOG_BAR_FLOOR = 10_000_000;

export default function RankingTable({ ranking: r }: { ranking: Ranking }) {
  const [filter, setFilter] = useState("");
  const [reversed, setReversed] = useState(false);
  const all = useMemo(() => ranked(r), [r]);
  const max = Math.max(...all.map((x) => x.value));

  const q = filter.trim().toLowerCase();
  let rows = all.filter((x) => x.name.toLowerCase().includes(q));
  if (reversed) rows = [...rows].reverse();

  return (
    <>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Filter by name…"
          aria-label="Filter entries"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button type="button" onClick={() => setReversed((v) => !v)}>
          ⇅ Reverse order
        </button>
      </div>
      {r.id === "us-highest-paid-ceos" && (
        <p className="bar-scale-note">Bar lengths use a logarithmic scale from $10 million, so smaller awards remain visible.</p>
      )}
      <table className="table ranking-data-table">
        <caption className="sr-only">{r.title} — {r.asOf ?? r.year}. Values in {r.unit}.</caption>
        <thead className="sr-only"><tr><th scope="col">Rank</th><th scope="col">Entry</th><th scope="col">Relative value</th><th scope="col">Value ({r.unit})</th></tr></thead>
        <tbody>
        {rows.length === 0 && <tr><td colSpan={4} className="empty">No entries match “{filter}”.</td></tr>}
        {rows.map((x) => {
          // Rank-style rankings (lower is better) show a bar that grows toward #1.
          const pct = r.unit === "Rank"
            ? ((all.length + 1 - x.rank) / all.length) * 100
            : r.id === "us-highest-paid-ceos"
              ? ((Math.log10(Math.max(x.value, LOG_BAR_FLOOR)) - Math.log10(LOG_BAR_FLOOR)) /
                  (Math.log10(max) - Math.log10(LOG_BAR_FLOOR))) * 100
              : (x.value / max) * 100;
          return (
            <tr className="row" key={x.name}>
              <td><RankBadge rank={x.rank} /></td>
              <th scope="row" className="name">
                {x.logo ? <Mark icon="" logo={x.logo} /> : ((!r.scope && !r.entityType) || r.entityType === "bank") && <span>{x.flag}</span>}
                <span className="name-block">
                  <span className="name-text" title={x.name}>
                    {x.name}
                  </span>
                  {x.detail && <span className="muted row-detail">{x.detail}</span>}
                </span>
                {x.logo && ((!r.scope && !r.entityType) || r.entityType === "bank") && <span className="muted">{x.flag}</span>}
              </th>
              <td className="track" aria-label="Relative value">
                <div className="fill" style={{ width: `${pct.toFixed(1)}%` }} />
              </td>
              <td className="val">{formatValue(r, x.value)}</td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </>
  );
}

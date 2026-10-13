"use client";

import { useMemo, useState } from "react";
import { formatValue, ranked } from "@/lib/format";
import type { Ranking } from "@/lib/types";
import Mark from "./Mark";
import RankBadge from "./RankBadge";

const LIMIT = 50;

export default function RankingTable({ ranking: r }: { ranking: Ranking }) {
  const [filter, setFilter] = useState("");
  const [reversed, setReversed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const all = useMemo(() => ranked(r), [r]);
  const max = Math.max(...all.map((x) => x.value));

  const q = filter.trim().toLowerCase();
  let rows = all.filter((x) => x.name.toLowerCase().includes(q));
  if (reversed) rows = [...rows].reverse();
  const total = rows.length;
  // Long lists (e.g. 200+ countries) start collapsed; searching shows every match.
  if (!showAll && !q && total > LIMIT) rows = rows.slice(0, LIMIT);

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
      <div className="table">
        {rows.length === 0 && <div className="empty">No entries match “{filter}”.</div>}
        {rows.map((x) => {
          // Rank-style rankings (lower is better) show a bar that grows toward #1.
          const pct = r.unit === "Rank" ? ((all.length + 1 - x.rank) / all.length) * 100 : (x.value / max) * 100;
          return (
            <div className="row" key={x.name}>
              <RankBadge rank={x.rank} />
              <div className="name">
                {x.logo ? <Mark icon="" logo={x.logo} /> : <span>{x.flag}</span>}
                <span title={x.name}>{x.name}</span>
                {x.logo && <span className="muted">{x.flag}</span>}
              </div>
              <div className="track">
                <div className="fill" style={{ width: `${pct.toFixed(1)}%` }} />
              </div>
              <div className="val">{formatValue(r, x.value)}</div>
            </div>
          );
        })}
      </div>
      {rows.length < total && (
        <button type="button" className="show-all" onClick={() => setShowAll(true)}>
          Show all {total} entries
        </button>
      )}
    </>
  );
}

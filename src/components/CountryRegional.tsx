"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import type { Ranking } from "@/lib/types";
import RankingTable from "./RankingTable";
import SourceLine from "./SourceLine";
import CopyRankingLink from "./CopyRankingLink";

const MONTH = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

/**
 * The rankings that exist only inside one country (its states, cities, universities…): a tab per ranking,
 * grouped by category, with the selected ranking shown as a full table.
 */
export default function CountryRegional({ rankings }: { rankings: Ranking[] }) {
  // Universities first: it is what people look for on a country page, and its first tab opens by default.
  const cats = [...CATEGORIES].sort((a, b) => Number(b.id === "education") - Number(a.id === "education"));
  const groups = cats.map((c) => ({ c, list: rankings.filter((x) => x.category === c.id) })).filter((g) => g.list.length);
  const [active, setActive] = useState(groups[0].list[0].id);
  const r = rankings.find((x) => x.id === active) ?? groups[0].list[0];
  return (
    <div className="regional">
      <div className="tabs" role="tablist" aria-label="Rankings in this country">
        {groups.map(({ c, list }) => (
          <div className="tab-group" key={c.id}>
            <span className="tab-group-label">
              {c.icon} {c.name}
            </span>
            {list.map((x) => (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={x.id === r.id}
                className={`tab ${x.id === r.id ? "on" : ""}`}
                onClick={() => setActive(x.id)}
              >
                {x.short ?? x.title}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="ranking-heading"><h3 className="regional-title">
        <Link href={`/ranking/${r.id}`}>
          {r.title}
        </Link>
      </h3><CopyRankingLink key={r.id} id={r.id} title={r.title} /></div>
      <p className="muted regional-desc">{r.desc}</p>
      <div className="meta">
        <span className="chip">📅 {r.asOf ? MONTH.format(new Date(`${r.asOf}-01T00:00:00Z`)) : r.year}</span>
        <span className="chip">📏 {r.unit}</span>
        <span className="chip">{r.items.length} entries</span>
      </div>
      <RankingTable key={r.id} ranking={r} />
      <SourceLine ranking={r} />
    </div>
  );
}

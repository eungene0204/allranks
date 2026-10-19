"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import type { Ranking } from "@/lib/types";
import RankingTable from "./RankingTable";
import SourceLine from "./SourceLine";
import CopyRankingLink from "./CopyRankingLink";
import FreshnessBadge from "./FreshnessBadge";

const MONTH = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

/**
 * The rankings that exist only inside one country (its states, cities, universities…): a tab per ranking,
 * grouped by category, with only the selected ranking loaded as a full table.
 */
type Tab = Pick<Ranking, "id" | "title" | "short" | "category">;

export default function CountryRegional({ code, rankings, initialRanking }: { code: string; rankings: Tab[]; initialRanking: Ranking }) {
  // Universities first: it is what people look for on a country page, and its first tab opens by default.
  const cats = [...CATEGORIES].sort((a, b) => Number(b.id === "education") - Number(a.id === "education"));
  const groups = cats.map((c) => ({ c, list: rankings.filter((x) => x.category === c.id) })).filter((g) => g.list.length);
  const [active, setActive] = useState(initialRanking.id);
  const [r, setRanking] = useState(initialRanking);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const rankingsCache = useRef(new Map([[initialRanking.id, initialRanking]]));
  const loading = active !== r.id;
  useEffect(() => {
    setError("");
    const cached = rankingsCache.current.get(active);
    if (cached) { setRanking(cached); return; }
    const controller = new AbortController();
    fetch(`/api/country/${encodeURIComponent(code)}/rankings?ranking=${encodeURIComponent(active)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load ranking.");
        return await response.json() as Ranking;
      })
      .then((ranking) => {
        if (controller.signal.aborted) return;
        rankingsCache.current.set(active, ranking);
        setRanking(ranking);
      })
      .catch(() => { if (!controller.signal.aborted) setError("Could not load ranking. Please try again."); });
    return () => controller.abort();
  }, [active, code, retry]);
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
                aria-selected={x.id === active}
                className={`tab ${x.id === active ? "on" : ""}`}
                onClick={() => setActive(x.id)}
              >
                {x.short ?? x.title}
              </button>
            ))}
          </div>
        ))}
      </div>
      {loading && !error && <p role="status">Loading ranking…</p>}
      {error && <p role="alert">{error} <button type="button" onClick={() => setRetry((value) => value + 1)}>Retry</button></p>}
      <div hidden={loading}>
      <div className="ranking-heading"><h3 className="regional-title">
        <Link href={`/ranking/${r.id}`}>
          {r.title}
        </Link>
      </h3><CopyRankingLink key={r.id} id={r.id} title={r.title} /></div>
      <p className="muted regional-desc">{r.desc}</p>
      <div className="meta">
        <FreshnessBadge year={r.year} />
        <span className="chip">📅 {r.asOf ? MONTH.format(new Date(`${r.asOf}-01T00:00:00Z`)) : r.year}</span>
        <span className="chip">📏 {r.unit}</span>
        <span className="chip">{r.items.length} entries</span>
      </div>
      <RankingTable key={r.id} ranking={r} />
      <SourceLine ranking={r} />
      </div>
    </div>
  );
}

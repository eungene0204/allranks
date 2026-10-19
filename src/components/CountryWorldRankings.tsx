"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Mark from "./Mark";
import RankBadge from "./RankBadge";
import CopyRankingLink from "./CopyRankingLink";
import FreshnessBadge from "./FreshnessBadge";

type Row = {
  id: string; title: string; icon: string; category: string; year: number; total: number; entryCount: number;
  entries: { name: string; rank: number; logo?: string; formatted: string }[];
};
const PAGE_SIZE = 48;

/** Keep the initial country view small even for countries in thousands of rankings. */
export default function CountryWorldRankings({ code, rows: initialRows, total }: { code: string; rows: Row[]; total: number }) {
  const [rows, setRows] = useState(initialRows);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pagesCache = useRef(new Map<number, Row[]>([[0, initialRows]]));
  const [page, setPage] = useState(0);
  const pages = Math.ceil(total / PAGE_SIZE);
  async function goTo(next: number) {
    setError("");
    const cached = pagesCache.current.get(next);
    if (cached) { setRows(cached); setPage(next); return; }
    setLoading(true);
    try {
      const response = await fetch(`/api/country/${encodeURIComponent(code)}/rankings?page=${next}`);
      if (!response.ok) throw new Error("Could not load rankings. Please try again.");
      const result = await response.json() as { rows: Row[] };
      pagesCache.current.set(next, result.rows);
      setRows(result.rows);
      setPage(next);
    } catch {
      setError("Could not load rankings. Please try again.");
    } finally { setLoading(false); }
  }
  const pagination = pages > 1 && <nav className="search-pagination" aria-label="World rankings pages">
    <button type="button" disabled={loading || page === 0} onClick={() => void goTo(page - 1)}>← Previous</button>
    <span>Page {page + 1} of {pages}</span>
    <button type="button" disabled={loading || page + 1 === pages} onClick={() => void goTo(page + 1)}>Next →</button>
  </nav>;
  return <>
    <p className="muted" role="status">Showing {total ? page * PAGE_SIZE + 1 : 0}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total} world rankings.</p>
    {pagination}
    {loading && <p role="status">Loading rankings…</p>}
    {error && <p role="alert">{error}</p>}
    <div className="cards" aria-busy={loading}>
      {rows.map((row) => <div className="ranking-card-shell" key={row.id}><div className="card">
        <span className="tag">{row.icon} {row.category}</span>
        <h3><Link href={`/ranking/${row.id}`} prefetch={false}>{row.title}</Link></h3>
        <FreshnessBadge year={row.year} />
        <ol>{row.entries.map((entry) => <li key={entry.name}>
          <RankBadge rank={entry.rank} />
          <span className="entry">{entry.logo && <Mark icon="" logo={entry.logo} />} {entry.name}</span>
          <span className="v">{entry.formatted}</span>
        </li>)}</ol>
        <Link className="more" href={`/ranking/${row.id}`} prefetch={false}>
          {row.entryCount > row.entries.length && `+${row.entryCount - row.entries.length} more · `}
          {row.entryCount} of {row.total} entries · full ranking →
        </Link>
      </div><CopyRankingLink id={row.id} title={row.title} /></div>)}
    </div>
    {pagination}
  </>;
}

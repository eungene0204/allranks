"use client";

import Link from "next/link";
import { useState } from "react";
import Mark from "./Mark";
import RankBadge from "./RankBadge";
import CopyRankingLink from "./CopyRankingLink";

type Row = {
  id: string; title: string; icon: string; category: string; total: number; entryCount: number;
  entries: { name: string; rank: number; logo?: string; formatted: string }[];
};
const PAGE_SIZE = 48;

/** Keep the initial country view small even for countries in thousands of rankings. */
export default function CountryWorldRankings({ rows }: { rows: Row[] }) {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(rows.length / PAGE_SIZE);
  const pagination = pages > 1 && <nav className="search-pagination" aria-label="World rankings pages">
    <button type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>← Previous</button>
    <span>Page {page + 1} of {pages}</span>
    <button type="button" disabled={page + 1 === pages} onClick={() => setPage((current) => current + 1)}>Next →</button>
  </nav>;
  return <>
    <p className="muted" role="status">Showing {rows.length ? page * PAGE_SIZE + 1 : 0}–{Math.min((page + 1) * PAGE_SIZE, rows.length)} of {rows.length} world rankings.</p>
    {pagination}
    <div className="cards">
      {rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((row) => <div className="ranking-card-shell" key={row.id}><div className="card">
        <span className="tag">{row.icon} {row.category}</span>
        <h3><Link href={`/ranking/${row.id}`}>{row.title}</Link></h3>
        <ol>{row.entries.map((entry) => <li key={entry.name}>
          <RankBadge rank={entry.rank} />
          <span className="entry">{entry.logo && <Mark icon="" logo={entry.logo} />} {entry.name}</span>
          <span className="v">{entry.formatted}</span>
        </li>)}</ol>
        <Link className="more" href={`/ranking/${row.id}`}>
          {row.entryCount > row.entries.length && `+${row.entryCount - row.entries.length} more · `}
          {row.entryCount} of {row.total} entries · full ranking →
        </Link>
      </div><CopyRankingLink id={row.id} title={row.title} /></div>)}
    </div>
    {pagination}
  </>;
}

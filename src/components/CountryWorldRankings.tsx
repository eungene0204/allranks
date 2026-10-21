import Link from "next/link";
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
export default function CountryWorldRankings({ code, rows, total, page = 1 }: { code: string; rows: Row[]; total: number; page?: number }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  const pagination = pages > 1 && <nav className="search-pagination" aria-label="World rankings pages">
    {page > 1 && <Link href={`/country/${code}${page > 2 ? `?page=${page - 1}` : ""}`} prefetch={false}>← Previous</Link>}
    <span>Page {page} of {pages}</span>
    {page < pages && <Link href={`/country/${code}?page=${page + 1}`} prefetch={false}>Next →</Link>}
  </nav>;
  return <>
    <p className="muted" role="status">Showing {total ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, total)} of {total} world rankings.</p>
    {pagination}
    <div className="cards">
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

import type { Metadata } from "next";
import Link from "next/link";
import RankingCard from "@/components/RankingCard";
import SearchForm from "@/components/SearchForm";
import { searchCountries, searchEntries, searchRankings } from "@/lib/data";
import { formatValue } from "@/lib/format";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: Props) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] ?? "" : raw ?? "").trim();
  const countries = searchCountries(q);
  const rankings = searchRankings(q);
  const entries = searchEntries(q);
  const count = countries.length + rankings.length + entries.length;
  return (
    <>
      <div className="page-head">
        <div className="crumbs"><Link href="/">Home</Link> / Search</div>
        <h1>{q ? `Results for “${q}”` : "Search"}</h1>
        {q && <p role="status" aria-live="polite">{countries.length} countries · {rankings.length} rankings · {entries.length} entries found.</p>}
      </div>
      <SearchForm query={q} id="results-search" />
      {countries.length > 0 && (
        <section>
          <h2 className="section">Countries</h2>
          <div className="cards">
            {countries.map((c) => (
              <Link className="card" key={c.code} href={`/country/${c.code}`}>
                <h3>{c.flag} {c.name}</h3>
                <span className="more">{c.appearances.length} world rankings · {c.regional.length} regional rankings →</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {rankings.length > 0 && (
        <section>
          <h2 className="section">Rankings</h2>
          <div className="cards">{rankings.map((r) => <RankingCard key={r.id} ranking={r} />)}</div>
        </section>
      )}
      {entries.length > 0 && (
        <section>
          <h2 className="section">Matching entries</h2>
          {entries.length > 100 && <p className="muted">Showing the first 100 of {entries.length} entries. Refine your search to narrow the results.</p>}
          <div className="cards">
            {entries.slice(0, 100).map(({ ranking: r, entry: e }) => (
              <Link className="card" key={`${r.id}-${e.name}`} href={`/ranking/${r.id}`}>
                <span className="tag">{r.icon} {r.title}</span>
                <h3>{e.flag} {e.name}</h3>
                {e.detail && <p>{e.detail}</p>}
                <span className="more">#{e.rank} · {formatValue(r, e.value)} · {r.year} →</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {count === 0 && <div className="empty">{q ? "Nothing found. Try Japan, GDP or MIT." : "Enter a country, ranking or entry name to search."}</div>}
    </>
  );
}

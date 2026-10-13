import type { Metadata } from "next";
import Link from "next/link";
import RankingCard from "@/components/RankingCard";
import { searchRankings } from "@/lib/data";

type Props = { searchParams: Promise<{ q?: string }> };

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: Props) {
  const q = ((await searchParams).q ?? "").trim();
  const hits = searchRankings(q);
  return (
    <>
      <div className="page-head">
        <div className="crumbs">
          <Link href="/">Home</Link> / Search
        </div>
        <h1>Results for “{q}”</h1>
        <p>
          {hits.length} ranking{hits.length === 1 ? "" : "s"} found.
        </p>
      </div>
      {hits.length > 0 ? (
        <div className="cards" style={{ marginTop: 24 }}>
          {hits.map((r) => (
            <RankingCard key={r.id} ranking={r} />
          ))}
        </div>
      ) : (
        <div className="empty">Nothing found. Try “GDP”, “Japan” or “university”.</div>
      )}
    </>
  );
}

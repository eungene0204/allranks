import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import RandomRankingCards from "@/components/RandomRankingCards";
import { allRankings } from "@/lib/data";
import { popularHomeRankings } from "@/lib/home-rankings";
import { toRankingCard } from "@/lib/ranking-card";

export const metadata: Metadata = pageMetadata('Popular rankings', 'Explore selected world rankings on widely followed topics, with sources and reference years.', '/popular');

export default function PopularRankingsPage() {
  const rankings = popularHomeRankings(allRankings().filter((ranking) => !ranking.scope));

  return (
    <>
      <div className="page-head">
        <div className="crumbs"><Link href="/">Home</Link> / Popular rankings</div>
        <h1>Popular rankings</h1>
        <p>Selected for broad public interest and clear comparisons across countries.</p>
      </div>
      <h2 className="section">{rankings.length} rankings</h2>
      <RandomRankingCards rankings={rankings.map(toRankingCard)} rerollOnRestore />
    </>
  );
}

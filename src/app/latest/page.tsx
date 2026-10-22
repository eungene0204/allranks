import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import RandomRankingCards from "@/components/RandomRankingCards";
import { allRankings } from "@/lib/data";
import { allLatestRankings } from "@/lib/home-rankings";
import { toRankingCard } from "@/lib/ranking-card";

export const metadata: Metadata = pageMetadata('Latest published rankings', 'Browse rankings from the latest publication year and recently added historical editions, with sources and reference periods.', '/latest');

export default function LatestRankingsPage() {
  const rankings = allLatestRankings(allRankings().filter((ranking) => !ranking.scope));

  return (
    <>
      <div className="page-head">
        <div className="crumbs"><Link href="/">Home</Link> / Latest rankings</div>
        <h1>Latest rankings</h1>
        <p>World rankings from the latest publication year, plus recently added historical editions. Each ranking shows its own data reference period.</p>
      </div>
      <h2 className="section">{rankings.length} rankings</h2>
      <RandomRankingCards rankings={rankings.map(toRankingCard)} shuffle={false} />
    </>
  );
}

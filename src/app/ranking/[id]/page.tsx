import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RankingInsights from "@/components/RankingInsights";
import RankingHistory from "@/components/RankingHistory";
import RankingContext from "@/components/RankingContext";
import RankingViz from "@/components/RankingViz";
import RankingTable from "@/components/RankingTable";
import SourceLine from "@/components/SourceLine";
import { getCategory } from "@/lib/categories";
import { allRankings, getRanking } from "@/lib/data";
import { flagEmoji } from "@/lib/format";
import { rankingSnippet } from "@/lib/insights";
import { supportsHistory } from "@/lib/ranking-history";

type Props = { params: Promise<{ id: string }> };

// Rankings are loaded from JSON files that can be added while the dev server
// is running. Allow unlisted IDs to resolve on demand, then let getRanking()
// decide whether the requested ranking exists.
export const dynamicParams = true;

export function generateStaticParams() {
  return allRankings().map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = getRanking((await params).id);
  if (!r) return {};
  return { title: `${r.title} (${r.asOf ?? r.year})`, description: rankingSnippet(r) };
}

export default async function RankingPage({ params }: Props) {
  const r = getRanking((await params).id);
  if (!r) notFound();
  const c = getCategory(r.category)!;
  const sample = r.source.kind === "manual" && r.source.verified === false;
  return (
    <>
      <div className="page-head">
        <div className="crumbs">
          <Link href="/">Home</Link> / <Link href={`/category/${c.id}`}>{c.name}</Link>
        </div>
        <h1>{r.title}</h1>
      </div>
      {(r.scope || sample || (r.source.kind === "agent" && r.source.verified === false)) && <div className="meta">
        {r.scope && (
          <Link className="chip" href={`/country/${r.scope}`}>
            {flagEmoji(r.scope)} See all of this country’s rankings →
          </Link>
        )}
        {sample && <span className="chip chip-warn">Sample data</span>}
        {r.source.kind === "agent" && r.source.verified === false && <span className="chip chip-warn">AI-collected · unverified</span>}
      </div>}
      {supportsHistory(r) && <RankingHistory id={r.id} title={r.title} order={r.order} defaultCountry={r.items[0].country!} format={{ prefix: r.prefix, suffix: r.suffix, decimals: r.decimals, unit: r.unit }} countries={r.items.flatMap((item) => item.country ? [{ code: item.country, name: item.name }] : []).sort((a, b) => a.name.localeCompare(b.name))} />}
      <RankingViz ranking={r} />
      <RankingTable ranking={r} />
      <RankingInsights ranking={r} />
      <SourceLine ranking={r} />
      <RankingContext ranking={r} />
    </>
  );
}

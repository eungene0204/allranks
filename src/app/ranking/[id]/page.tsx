import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
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
import { rankingSnippet, rankingSummary } from "@/lib/insights";
import { latestHomeRankings, popularHomeRankings } from "@/lib/home-rankings";
import { supportsHistory } from "@/lib/ranking-history";

type Props = { params: Promise<{ id: string }> };

// Prebuild home selections; other valid rankings are rendered and cached on first request.
export const dynamicParams = true;

export function generateStaticParams() {
  const world = allRankings().filter((ranking) => !ranking.scope);
  return [...new Set([...latestHomeRankings(world), ...popularHomeRankings(world)].map((ranking) => ranking.id))]
    .map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = getRanking((await params).id);
  if (!r) notFound();
  return pageMetadata(`${r.title} (${r.asOf ?? r.year})`, rankingSnippet(r), `/ranking/${r.id}`);
}

export default async function RankingPage({ params }: Props) {
  const r = getRanking((await params).id);
  if (!r) notFound();
  const c = getCategory(r.category)!;
  const sample = r.source.kind === "manual" && r.source.verified === false;
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Home", path: "/" }, { name: c.name, path: `/category/${c.id}` }, { name: r.title, path: `/ranking/${r.id}` }])} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Dataset", "@id": `${SITE_URL}/ranking/${r.id}#dataset`,
        name: r.title, description: r.desc, url: `${SITE_URL}/ranking/${r.id}`, inLanguage: "en",
        temporalCoverage: String(r.asOf ?? r.year), citation: r.source.url,
        isBasedOn: r.source.url ? { "@type": "CreativeWork", name: r.source.name, url: r.source.url } : undefined,
        publisher: { "@id": `${SITE_URL}/#organization` },
      }} />
      <div className="page-head">
        <div className="crumbs">
          <Link href="/">Home</Link> / <Link href={`/category/${c.id}`}>{c.name}</Link>
        </div>
        <h1>{r.title}</h1>
        <p>{rankingSummary(r)}</p>
      </div>
      {(r.scope || sample || (r.source.kind === "agent" && r.source.verified === false)) && <div className="meta">
        {r.scope && (
          <Link className="chip" href={`/country/${r.scope}`}>
            {flagEmoji(r.scope)} See all of this country’s rankings →
          </Link>
        )}
        {sample && <span className="chip chip-warn" title="Sources are linked below; the editorial ranking has not been independently verified.">Editorial shortlist · verification pending</span>}
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

import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata, pageSchema } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import RankingComparison from "@/components/RankingComparison";
import RankingReading, { RankingCoverage } from "@/components/RankingReading";
import { supportsSnapshotComparison } from "@/lib/ranking-content";
import RankingHistory from "@/components/RankingHistory";
import RankingContext from "@/components/RankingContext";
import RankingViz from "@/components/RankingViz";
import RankingTable from "@/components/RankingTable";
import SourceLine from "@/components/SourceLine";
import { getCategory } from "@/lib/categories";
import { allRankings, getRanking } from "@/lib/data";
import { flagEmoji, ranked } from "@/lib/format";
import { rankingSearchTitle, rankingSnippet, rankingSummary } from "@/lib/insights";
import { latestHomeRankings, popularHomeRankings } from "@/lib/home-rankings";
import { supportsHistory } from "@/lib/ranking-history";
import type { Ranking } from "@/lib/types";

function datasetLicense(license: string | undefined) {
  if (license === "CC BY 4.0" || /^CC BY 4\.0 \((GeoNames|Epoch AI|Our World in Data)\)$/.test(license ?? "")) {
    return "https://creativecommons.org/licenses/by/4.0/";
  }
  if (/^CC0 1\.0 \((OpenAlex|Wikidata)\)$/.test(license ?? "")) return "https://creativecommons.org/publicdomain/zero/1.0/";
  if (license === "Open Government Licence v3.0") return "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/";
  if (license === "Public domain (OurAirports)") return "https://ourairports.com/data/";
}

function rankingSchema(r: Ranking, path: string) {
  const page = pageSchema(path, r.title);
  const license = datasetLicense(r.source.license);
  if (!license || !r.source.url) return { "@context": "https://schema.org", ...page };
  const datasetId = `${page.url}#dataset`;
  return { "@context": "https://schema.org", "@graph": [
    { ...page, mainEntity: { "@id": datasetId } },
    { "@type": "Dataset", "@id": datasetId, name: r.title, description: r.desc, url: page.url,
      inLanguage: page.inLanguage, temporalCoverage: String(r.asOf ?? r.year), license, citation: r.source.url,
      isBasedOn: { "@type": "CreativeWork", name: r.source.name, url: r.source.url },
      publisher: page.publisher, mainEntityOfPage: { "@id": page["@id"] } },
  ] };
}

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
  return pageMetadata(`${rankingSearchTitle(r)} (${r.asOf ?? r.year})`, rankingSnippet(r), `/ranking/${r.id}`);
}

export default async function RankingPage({ params }: Props) {
  const r = getRanking((await params).id);
  if (!r) notFound();
  const c = getCategory(r.category)!;
  const path = `/ranking/${r.id}`;
  const hasHistory = supportsHistory(r);
  return (
    <>
      <JsonLd data={rankingSchema(r, path)} />
      <div className="page-head">
        <Breadcrumbs items={[{ name: c.name, path: `/category/${c.id}` }, { name: r.title, path }]} />
        <h1>{r.title}</h1>
      </div>
      {r.scope && <div className="meta">
          <Link className="chip" href={`/country/${r.scope}`}>
            {flagEmoji(r.scope)} See all of this country’s rankings →
          </Link>
      </div>}
      <section className="ranking-summary" aria-labelledby="ranking-summary-title">
        <h2 id="ranking-summary-title">At a glance</h2>
        <p>{rankingSummary(r)}</p>
      </section>
      <p className="muted">Reference: {r.asOf ?? r.year} · Unit: {r.unit} · {r.items.length} listed entries.
        {hasHistory && <>{" "}<a className="history-jump" href="#ranking-history-title">See year-by-year change ↓</a></>}
      </p>
      <SourceLine ranking={r} />
      <RankingViz ranking={r} />
      {supportsSnapshotComparison(r) && <RankingComparison key={r.id} entries={ranked(r).map((entry) => ({ name: entry.name, value: entry.value, position: entry.rank }))} format={{ prefix: r.prefix, suffix: r.suffix, decimals: r.decimals, unit: r.unit }} period={r.asOf ?? String(r.year)} />}
      <RankingTable ranking={r} />
      {hasHistory && <RankingHistory id={r.id} title={r.title} order={r.order} defaultCountry={r.items[0].country!} format={{ prefix: r.prefix, suffix: r.suffix, decimals: r.decimals, unit: r.unit }} countries={r.items.flatMap((item) => item.country ? [{ code: item.country, name: item.name }] : []).sort((a, b) => a.name.localeCompare(b.name))} />}

      {r.id === "rolling-stone-best-rock-songs-21st-century-2026" && (
        <section className="ranking-summary" aria-labelledby="rock-reading-title">
          <h2 id="rock-reading-title">How to read this list</h2>
          <p>The positions follow Rolling Stone’s editorial selections across rock styles. The list includes tracks the publisher dates to 2000, and the table retains its release-year labels.</p>
        </section>
      )}
      <RankingCoverage ranking={r} />
      <RankingReading ranking={r} />
      <RankingContext ranking={r} />
    </>
  );
}

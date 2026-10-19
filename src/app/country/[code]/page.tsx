import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CountryRegional from "@/components/CountryRegional";
import CountryWorldRankings from "@/components/CountryWorldRankings";
import CountryDiscoveries from "@/components/CountryDiscoveries";
import CopyRankingLink from "@/components/CopyRankingLink";
import FreshnessBadge from "@/components/FreshnessBadge";
import { countryDiscoveries } from "@/lib/discoveries";
import { flagEmoji } from "@/lib/format";
import { CATEGORIES } from "@/lib/categories";
import { countryRankingPage } from "@/lib/country-ranking-page";
import { allRankings, countryDetail, countryInfo } from "@/lib/data";

type Props = { params: Promise<{ code: string }> };

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const code = (await params).code;
  const info = countryInfo(code);
  if (!info) return {};
  const discoveries = countryDiscoveries(allRankings(), code);
  return {
    title: `${flagEmoji(code)} ${info.name} — rankings`,
    description: `Explore ${info.name} in world rankings, plus its cities, universities and other rankings within the country.`,
    ...(discoveries.length ? {
      openGraph: { images: [{ url: `/country/${code}/discoveries/share`, width: 1200, height: 630, alt: `${info.name} — standout strengths with sources and reference periods` }] },
      twitter: { card: "summary_large_image" as const, images: [`/country/${code}/discoveries/share`] },
    } : {}),
  };
}

export default async function CountryPage({ params }: Props) {
  const d = countryDetail((await params).code);
  if (!d) notFound();
  const { summary: c, world, regional, keyStats } = d;
  const firstCategory = [...CATEGORIES].sort((a, b) => Number(b.id === "education") - Number(a.id === "education"))
    .find((category) => regional.some((ranking) => ranking.category === category.id));
  const initialRegional = regional.find((ranking) => ranking.category === firstCategory?.id);
  const initialWorld = countryRankingPage(c.code, 0)!;
  return (
    <>
      <div className="page-head">
        <div className="crumbs">
          <Link href="/">Home</Link> / Countries
        </div>
        <h1>
          {c.flag} {c.name}
        </h1>
        <p>
          {d.region && `${d.region} · `}
          {regional.length > 0
            ? `${regional.length} rankings that exist only inside ${c.name} — its states, cities, universities and more.`
            : `We don't have rankings inside ${c.name} yet. Here is how it places in the world rankings.`}
        </p>
      </div>
      <div className="meta">
        <span className="chip">🥇 {c.firsts} × #1 worldwide</span>
        <span className="chip">🏅 {c.top3} × top 3</span>
        <span className="chip">📊 {world.length} world rankings</span>
        {regional.length > 0 && <span className="chip">🗺️ {regional.length} rankings inside {c.name}</span>}
      </div>

      <CountryDiscoveries code={c.code} name={c.name} discoveries={countryDiscoveries(allRankings(), c.code)} />

      {keyStats.length > 0 && (
        <div className="keystats">
          {keyStats.map((k) => (
            <div className="ranking-card-shell" key={k.id}><Link className="keystat" href={`/ranking/${k.id}`}>
              <span className="ks-label">
                {k.icon} {k.label}
              </span>
              <b>{k.value}</b>
              <FreshnessBadge year={k.year} />
              <span className="ks-rank">
                #{k.rank} of {k.total}
              </span>
            </Link>
            <CopyRankingLink id={k.id} title={k.label} /></div>
          ))}
        </div>
      )}

      {regional.length > 0 && (
        <>
          <h2 className="section">Rankings inside {c.name}</h2>
          <CountryRegional key={c.code} code={c.code} rankings={regional.map(({ id, title, short, category }) => ({ id, title, short, category }))} initialRanking={initialRegional!} />
        </>
      )}

      <h2 className="section">{c.name} in world rankings</h2>
      <CountryWorldRankings key={c.code} code={c.code} rows={initialWorld.rows} total={initialWorld.total} />

    </>
  );
}

import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, pageMetadata, pageNumber } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import CountryRegional from "@/components/CountryRegional";
import CountryWorldRankings from "@/components/CountryWorldRankings";
import CountryDiscoveries from "@/components/CountryDiscoveries";
import CopyRankingLink from "@/components/CopyRankingLink";
import FreshnessBadge from "@/components/FreshnessBadge";
import { countryDiscoveries } from "@/lib/discoveries";
import { CATEGORIES } from "@/lib/categories";
import { COUNTRY_PAGE_SIZE, countryRankingPage } from "@/lib/country-ranking-page";
import { allRankings, countryDetail } from "@/lib/data";

type Props = { params: Promise<{ code: string }>; searchParams: Promise<{ page?: string }> };

export const dynamicParams = true;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const code = (await params).code;
  const detail = countryDetail(code);
  if (!detail) notFound();
  const page = pageNumber((await searchParams).page, Math.ceil(detail.world.length / COUNTRY_PAGE_SIZE));
  const name = detail.summary.name;
  const image = countryDiscoveries(allRankings(), code).length ? `/country/${code}/discoveries/share` : undefined;
  return pageMetadata(`${name} rankings${page > 1 ? ` — Page ${page}` : ""}`, `Explore ${name} in world rankings, plus its cities, universities and other rankings within the country.`, `/country/${code}${page > 1 ? `?page=${page}` : ""}`, image);
}

export default async function CountryPage({ params, searchParams }: Props) {
  const d = countryDetail((await params).code);
  if (!d) notFound();
  const { summary: c, world, regional, keyStats } = d;
  const firstCategory = [...CATEGORIES].sort((a, b) => Number(b.id === "education") - Number(a.id === "education"))
    .find((category) => regional.some((ranking) => ranking.category === category.id));
  const initialRegional = regional.find((ranking) => ranking.category === firstCategory?.id);
  const page = pageNumber((await searchParams).page, Math.ceil(world.length / COUNTRY_PAGE_SIZE));
  const initialWorld = countryRankingPage(c.code, page - 1)!;
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Home", path: "/" }, { name: c.name, path: `/country/${c.code}` }])} />
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
      <CountryWorldRankings key={c.code} code={c.code} rows={initialWorld.rows} total={initialWorld.total} page={page} />

    </>
  );
}

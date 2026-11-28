import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { collectionPage, collectionPath, collectionRedirect, pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import CountryRegional from "@/components/CountryRegional";
import CountryWorldRankings from "@/components/CountryWorldRankings";
import CountryDiscoveries from "@/components/CountryDiscoveries";
import CopyRankingLink from "@/components/CopyRankingLink";
import FreshnessBadge from "@/components/FreshnessBadge";
import { countryDiscoveries } from "@/lib/discoveries";
import { CATEGORIES } from "@/lib/categories";
import { COUNTRY_PAGE_SIZE, countryRankingPage } from "@/lib/country-ranking-page";
import { allRankings, countryDetail } from "@/lib/data";

type Props = { params: Promise<{ code: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export const dynamicParams = true;

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const code = (await params).code.toUpperCase();
  const detail = countryDetail(code);
  if (!detail) notFound();
  const pages = Math.max(1, Math.ceil(detail.world.length / COUNTRY_PAGE_SIZE));
  const page = collectionPage((await searchParams).page, pages);
  if (page === undefined) notFound();
  const name = detail.summary.name;
  const image = countryDiscoveries(allRankings(), code).length ? `/country/${code}/discoveries/share` : undefined;
  const regional = detail.regional.length ? ` It also has ${detail.regional.length} rankings of places and entries within the country.` : "";
  const description = page > 1
    ? `Explore page ${page} of ${pages} of ${name}’s world ranking listings, with sources and reference years.`
    : `See where ${name} places across ${detail.world.length} world rankings, with sources and reference years.${regional}`;
  return pageMetadata(`${name} rankings${page > 1 ? ` — Page ${page}` : ""}`, description, collectionPath(`/country/${code}`, page), image);
}

export default async function CountryPage({ params, searchParams }: Props) {
  const { code } = await params;
  const d = countryDetail(code.toUpperCase());
  if (!d) notFound();
  const { summary: c, world, regional, keyStats } = d;
  const query = await searchParams;
  const page = collectionPage(query.page, Math.ceil(world.length / COUNTRY_PAGE_SIZE));
  if (page === undefined) notFound();
  const path = `/country/${c.code}`;
  if (code !== c.code || query.page === "1") permanentRedirect(collectionRedirect(path, page, query));
  const firstCategory = [...CATEGORIES].sort((a, b) => Number(b.id === "education") - Number(a.id === "education"))
    .find((category) => regional.some((ranking) => ranking.category === category.id));
  const initialRegional = regional.find((ranking) => ranking.category === firstCategory?.id);
  const initialWorld = countryRankingPage(c.code, page - 1)!;
  return (
    <>
      <div className="page-head">
        <Breadcrumbs items={[{ name: c.name, path }, ...(page > 1 ? [{ name: `Page ${page}`, path: collectionPath(path, page) }] : [])]} />
        <h1>
          {c.flag} {c.name}
        </h1>
        <p>
          {d.region && `${d.region} · `}
          {c.name} appears in {world.length} world rankings on AllRanks.
          {regional.length > 0 && ` The site also lists ${regional.length} rankings within ${c.name}.`}
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
          <details className="ranking-directory">
            <summary>Open individual rankings within {c.name}</summary>
            <ul>{regional.map(({ id, title }) => <li key={id}><Link href={`/ranking/${id}`} prefetch={false}>{title}</Link></li>)}</ul>
          </details>
        </>
      )}

      <h2 className="section">{c.name} in world rankings</h2>
      <CountryWorldRankings key={c.code} code={c.code} rows={initialWorld.rows} total={initialWorld.total} page={page} />

    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CountryRegional from "@/components/CountryRegional";
import Mark from "@/components/Mark";
import RankBadge from "@/components/RankBadge";
import { getCategory } from "@/lib/categories";
import { countryCodes, countryDetail } from "@/lib/data";

type Props = { params: Promise<{ code: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return countryCodes().map((code) => ({ code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = countryDetail((await params).code);
  if (!d) return {};
  return {
    title: `${d.summary.flag} ${d.summary.name} — rankings`,
    description: `Every ranking ${d.summary.name} appears in: ${d.world.map((w) => w.ranking.title).join(", ")}.`,
  };
}

const ENTRY_LIMIT = 8;

export default async function CountryPage({ params }: Props) {
  const d = countryDetail((await params).code);
  if (!d) notFound();
  const { summary: c, world, regional, keyStats } = d;
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

      {keyStats.length > 0 && (
        <div className="keystats">
          {keyStats.map((k) => (
            <Link className="keystat" href={`/ranking/${k.id}`} key={k.id}>
              <span className="ks-label">
                {k.icon} {k.label}
              </span>
              <b>{k.value}</b>
              <span className="ks-rank">
                #{k.rank} of {k.total}
              </span>
            </Link>
          ))}
        </div>
      )}

      {regional.length > 0 && (
        <>
          <h2 className="section">Rankings inside {c.name}</h2>
          <CountryRegional rankings={regional} />
        </>
      )}

      <h2 className="section">{c.name} in world rankings</h2>
      <div className="cards">
        {world.map(({ ranking: r, entries, total }) => (
          <div className="card" key={r.id}>
            <span className="tag">
              {r.icon} {getCategory(r.category)?.name}
            </span>
            <h3>
              <Link href={`/ranking/${r.id}`}>{r.title}</Link>
            </h3>
            <ol>
              {entries.slice(0, ENTRY_LIMIT).map((e) => (
                <li key={e.name}>
                  <RankBadge rank={e.rank} />
                  <span className="entry">
                    {e.logo && <Mark icon="" logo={e.logo} />} {e.name}
                  </span>
                  <span className="v">{e.formatted}</span>
                </li>
              ))}
            </ol>
            <Link className="more" href={`/ranking/${r.id}`}>
              {entries.length > ENTRY_LIMIT && `+${entries.length - ENTRY_LIMIT} more · `}
              {entries.length > 1 ? `${entries.length} of ${total} entries` : `1 of ${total} entries`} · full ranking →
            </Link>
          </div>
        ))}
      </div>

    </>
  );
}

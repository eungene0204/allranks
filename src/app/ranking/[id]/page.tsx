import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RankingTable from "@/components/RankingTable";
import SourceLine from "@/components/SourceLine";
import { getCategory } from "@/lib/categories";
import { allRankings, getRanking } from "@/lib/data";
import { flagEmoji } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return allRankings().map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = getRanking((await params).id);
  if (!r) return {};
  return { title: `${r.title} (${r.asOf ?? r.year})`, description: r.desc };
}

const MONTH = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

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
        <h1>
          {r.icon} {r.title}
        </h1>
        <p>{r.desc}</p>
      </div>
      <div className="meta">
        <span className="chip">📅 {r.asOf ? MONTH.format(new Date(`${r.asOf}-01T00:00:00Z`)) : r.year}</span>
        <span className="chip">📏 {r.unit}</span>
        <span className="chip">{r.items.length} entries</span>
        {r.scope && (
          <Link className="chip" href={`/country/${r.scope}`}>
            {flagEmoji(r.scope)} See all of this country’s rankings →
          </Link>
        )}
        {sample && <span className="chip chip-warn">Sample data</span>}
      </div>
      <RankingTable ranking={r} />
      <SourceLine ranking={r} />
    </>
  );
}

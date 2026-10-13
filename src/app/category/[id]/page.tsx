import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RankingCard from "@/components/RankingCard";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { rankingsIn } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCategory((await params).id);
  if (!c) return {};
  return { title: `${c.name} rankings`, description: `${c.blurb}. Browse every ${c.name.toLowerCase()} ranking.` };
}

export default async function CategoryPage({ params }: Props) {
  const c = getCategory((await params).id);
  if (!c) notFound();
  const list = rankingsIn(c.id)
    .filter((r) => c.id !== "world" || !r.scope)
    .sort((a, b) => Number(Boolean(a.scope)) - Number(Boolean(b.scope)));
  return (
    <>
      <div className="page-head">
        <div className="crumbs">
          <Link href="/">Home</Link> / {c.name}
        </div>
        <h1>
          {c.icon} {c.name}
        </h1>
        <p>{c.blurb}</p>
      </div>
      <h2 className="section">{list.length} rankings</h2>
      {list.length === 0 && <p>Rankings in this category are coming soon.</p>}
      <div className="cards">
        {list.map((r) => (
          <RankingCard key={r.id} ranking={r} />
        ))}
      </div>
    </>
  );
}

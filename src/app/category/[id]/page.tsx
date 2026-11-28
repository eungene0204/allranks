import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { collectionPage, collectionPath, collectionRedirect, pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import RandomRankingCards from "@/components/RandomRankingCards";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { rankingsIn } from "@/lib/data";
import { toRankingCard } from "@/lib/ranking-card";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const PAGE_SIZE = 48;
const categoryRankings = (id: string) => rankingsIn(id).filter((r) => id !== "world" || !r.scope).sort((a, b) => Number(Boolean(a.scope)) - Number(Boolean(b.scope)));

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const c = getCategory((await params).id);
  if (!c) notFound();
  const pages = Math.max(1, Math.ceil(categoryRankings(c.id).length / PAGE_SIZE));
  const page = collectionPage((await searchParams).page, pages);
  if (page === undefined) notFound();
  const description = page > 1
    ? `Browse page ${page} of ${pages} in AllRanks’ ${c.name.toLowerCase()} rankings. ${c.blurb}.`
    : `${c.blurb}. Browse ${c.name.toLowerCase()} rankings with original sources and reference years.`;
  return pageMetadata(`${c.name} rankings${page > 1 ? ` — Page ${page}` : ""}`, description, collectionPath(`/category/${c.id}`, page));
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const c = getCategory((await params).id);
  if (!c) notFound();
  const list = categoryRankings(c.id);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const query = await searchParams;
  const page = collectionPage(query.page, pages);
  if (page === undefined) notFound();
  const path = `/category/${c.id}`;
  if (query.page === "1") permanentRedirect(collectionRedirect(path, page, query));
  return (
    <>
      <div className="page-head">
        <Breadcrumbs items={[{ name: c.name, path }, ...(page > 1 ? [{ name: `Page ${page}`, path: collectionPath(path, page) }] : [])]} />
        <h1>
          {c.icon} {c.name}
        </h1>
        <p>{c.blurb}</p>
        <p>Each list uses its own measure, period and coverage. <Link href="/guides">Read our comparison guides</Link> before interpreting a position.</p>
      </div>
      <h2 className="section">{list.length} rankings</h2>
      {list.length === 0 && <p>Rankings in this category are coming soon.</p>}
      <RandomRankingCards rankings={list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(toRankingCard)} shuffle={false} />
      {pages > 1 && <nav className="search-pagination" aria-label="Category pages">
        {page > 1 && <Link href={collectionPath(path, page - 1)} prefetch={false}>← Previous</Link>}
        <span>Page {page} of {pages}</span>
        {page < pages && <Link href={collectionPath(path, page + 1)} prefetch={false}>Next →</Link>}
      </nav>}
    </>
  );
}

import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, pageMetadata, pageNumber } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import RandomRankingCards from "@/components/RandomRankingCards";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { rankingsIn } from "@/lib/data";
import { toRankingCard } from "@/lib/ranking-card";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ page?: string }> };
const PAGE_SIZE = 48;
const categoryRankings = (id: string) => rankingsIn(id).filter((r) => id !== "world" || !r.scope).sort((a, b) => Number(Boolean(a.scope)) - Number(Boolean(b.scope)));

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const c = getCategory((await params).id);
  if (!c) return {};
  const page = pageNumber((await searchParams).page, Math.ceil(categoryRankings(c.id).length / PAGE_SIZE));
  return pageMetadata(`${c.name} rankings${page > 1 ? ` — Page ${page}` : ""}`, `${c.blurb}. Browse ${c.name.toLowerCase()} rankings with original sources and reference years.`, `/category/${c.id}${page > 1 ? `?page=${page}` : ""}`);
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const c = getCategory((await params).id);
  if (!c) notFound();
  const list = categoryRankings(c.id);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = pageNumber((await searchParams).page, pages);
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Home", path: "/" }, { name: c.name, path: `/category/${c.id}` }])} />
      <div className="page-head">
        <div className="crumbs">
          <Link href="/">Home</Link> / {c.name}
        </div>
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
        {page > 1 && <Link href={`/category/${c.id}${page > 2 ? `?page=${page - 1}` : ""}`} prefetch={false}>← Previous</Link>}
        <span>Page {page} of {pages}</span>
        {page < pages && <Link href={`/category/${c.id}?page=${page + 1}`} prefetch={false}>Next →</Link>}
      </nav>}
    </>
  );
}

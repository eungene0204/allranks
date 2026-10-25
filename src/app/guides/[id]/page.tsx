import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EconomicComparison from "@/components/EconomicComparison";
import JsonLd from "@/components/JsonLd";
import { allRankings, getRanking } from "@/lib/data";
import { GUIDE_REVIEWED_AT, READING_GUIDES, getReadingGuide, guideForRanking } from "@/lib/reading-guides";
import { breadcrumbs, pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() { return READING_GUIDES.map(({ id }) => ({ id })); }
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getReadingGuide((await params).id);
  if (!guide) notFound();
  return pageMetadata(guide.title, guide.answer, `/guides/${guide.id}`);
}
export default async function GuidePage({ params }: Props) {
  const guide = getReadingGuide((await params).id);
  if (!guide) notFound();
  const related = guide.rankingIds.map(getRanking).filter((r) => r !== undefined);
  const examples = related.length ? related : allRankings().filter((r) => guideForRanking(r)?.id === guide.id).slice(0, 4);
  return <>
    <JsonLd data={breadcrumbs([{ name: "Home", path: "/" }, { name: "Reading guides", path: "/guides" }, { name: guide.title, path: `/guides/${guide.id}` }])} />
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.answer,
      datePublished: GUIDE_REVIEWED_AT, dateModified: GUIDE_REVIEWED_AT, inLanguage: "en",
      author: { "@type": "Organization", name: "AllRanks", url: `${SITE_URL}/editorial-policy` },
      publisher: { "@id": `${SITE_URL}/#organization` }, citation: guide.sources.map((source) => source.url),
      mainEntityOfPage: `${SITE_URL}/guides/${guide.id}` }} />
    <article className="reading-article">
      <header className="page-head"><div className="crumbs"><Link href="/guides">Reading guides</Link></div>
        <h1>{guide.title}</h1><p>{guide.question}</p>
        <p className="editorial-byline">AllRanks assistant · Sources reviewed {GUIDE_REVIEWED_AT} · <Link href="/editorial-policy">Editorial process</Link></p>
      </header>
      <div className="prose"><p className="guide-answer">{guide.answer}</p>
        {guide.sections.map((section) => <section key={section.title}><h2>{section.title}</h2><p>{section.text}</p></section>)}
        {guide.id === "economic-size-and-living-standards" && <EconomicComparison />}
        <h2>{guide.id === "reading-product-shortlists" ? "Explore the source lists" : "Try the comparison"}</h2><p>Open a dataset, check its period and inclusion rules, then read its entries. These tables remain attributed to their original publishers.</p>
        <ul>{examples.map((r) => <li key={r.id}><Link href={`/ranking/${r.id}`}>{r.title}</Link> — {r.asOf ?? r.year}, {r.items.length} entries</li>)}</ul>
        <h2>Sources behind this explanation</h2>
        <p>Publisher definitions support the factual descriptions above. The reading suggestions and illustrative calculations are AllRanks’ explanation; they are not additional measurements by the publisher.</p>
        <ul>{guide.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></li>)}</ul>
        <p>Found a problem? <Link href="/about#contact">Send the page, the disputed statement and a supporting source.</Link></p>
      </div>
    </article>
  </>;
}

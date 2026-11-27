import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { columnDateLabel, columnPath, getColumn, publishedColumns } from "@/lib/columns";
import { getRanking } from "@/lib/data";
import { breadcrumbs, pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return publishedColumns().map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: Props) {
  const column = getColumn((await params).id);
  if (!column) notFound();
  const page = pageMetadata(column.title, column.summary, columnPath(column.id));
  return {
    ...page,
    alternates: { ...page.alternates, types: { "application/rss+xml": `${SITE_URL}/columns/feed.xml` } },
    openGraph: { ...page.openGraph, type: "article" as const, publishedTime: column.publishedOn },
  };
}

export default async function ColumnPage({ params }: Props) {
  const column = getColumn((await params).id);
  if (!column) notFound();
  const path = columnPath(column.id);
  const rankings = column.rankingIds.map(getRanking).filter((ranking) => ranking !== undefined);
  return (
    <>
      <JsonLd data={breadcrumbs([{ name: "Home", path: "/" }, { name: "Columns", path: "/columns" }, { name: column.title, path }])} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Article", headline: column.title, description: column.summary,
        datePublished: column.publishedOn, inLanguage: "en",
        author: { "@type": "Organization", name: "AllRanks", url: `${SITE_URL}/editorial-policy` },
        publisher: { "@id": `${SITE_URL}/#organization` }, citation: column.sources.map(({ url }) => url),
        mainEntityOfPage: `${SITE_URL}${path}`,
      }} />
      <article className="reading-article">
        <header className="page-head">
          <div className="crumbs"><Link href="/">Home</Link> / <Link href="/columns">Columns</Link></div>
          <h1>{column.title}</h1>
          <p className="editorial-byline">AllRanks assistant · <time dateTime={column.publishedOn}>{columnDateLabel(column.publishedOn)}</time></p>
        </header>
        <div className="prose">
          <p className="guide-answer">{column.summary}</p>
          {column.table && (
            <div className="column-table-scroll" tabIndex={0} role="region" aria-label={column.table.caption}>
              <table className="column-table">
                <caption>{column.table.caption}</caption>
                <thead><tr>{column.table.headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead>
                <tbody>
                  {column.table.rows.map(([label, ...cells]) => (
                    <tr key={label}>
                      <th scope="row">{label}</th>
                      {cells.map((cell, index) => <td key={column.table?.headers[index + 1]}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {column.sections.map(({ title, paragraphs }) => (
            <section key={title}>
              <h2>{title}</h2>
              {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
          <h2>Explore the rankings</h2>
          <ul>{rankings.map(({ id, title }) => <li key={id}><Link href={`/ranking/${id}`}>{title}</Link></li>)}</ul>
          <h2>Sources and verification</h2>
          <p>Data edition · {column.edition}</p>
          <p>{column.sourceReview}</p>
          <ul>{column.sources.map(({ title, url }) => <li key={url}><a href={url}>{title}</a></li>)}</ul>
          <p><Link href="/editorial-policy">Editorial process and corrections</Link></p>
        </div>
      </article>
    </>
  );
}

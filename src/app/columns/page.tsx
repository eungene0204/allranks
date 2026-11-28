import Link from "next/link";
import ColumnCards from "@/components/ColumnCards";
import { publishedColumns } from "@/lib/columns";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

const page = pageMetadata("Ranking analysis columns", "Explore AllRanks comparisons of published rankings, with data sources, methods and limits.", "/columns");

export const metadata = {
  ...page,
  alternates: { ...page.alternates, types: { "application/rss+xml": `${SITE_URL}/columns/feed.xml` } },
};

export default function ColumnsPage() {
  return (
    <>
      <header className="page-head">
        <div className="crumbs"><Link href="/">Home</Link> / Columns</div>
        <h1>Columns</h1>
        <p>AllRanks explains what published rankings show and how their methods affect the comparison.</p>
        <p><Link href="/columns/feed.xml">Subscribe via RSS</Link></p>
      </header>
      <ColumnCards columns={publishedColumns()} heading="h2" />
    </>
  );
}

import Link from "next/link";
import ColumnCards from "@/components/ColumnCards";
import { publishedColumns } from "@/lib/columns";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

const page = pageMetadata("Columns", "Daily analysis of recent rankings, with original data, methods and comparisons from AllRanks.", "/columns");

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
        <p>Daily analysis of recent rankings, grounded in the original data and methodology.</p>
        <p><Link href="/columns/feed.xml">Subscribe via RSS</Link></p>
      </header>
      <ColumnCards columns={publishedColumns()} heading="h2" />
    </>
  );
}

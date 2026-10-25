import Link from "next/link";
import ReadingGuideCards from "@/components/ReadingGuideCards";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("How to read country rankings", "Source-backed guides to economic size, prices, employment, internet use and research metrics. Understand what a ranking can and cannot tell you.", "/guides");

export default function GuidesPage() {
  return <>
    <div className="page-head"><div className="crumbs"><Link href="/">Home</Link> / Reading guides</div>
      <h1>Make a comparison that answers your question</h1>
      <p>A position is a starting point. These guides explain the denominator, coverage and limitations behind the numbers.</p>
    </div>
    <ReadingGuideCards />
    <p className="source">Written and source-checked by the AllRanks assistant. <Link href="/editorial-policy">How we prepare and correct our explanations →</Link></p>
  </>;
}

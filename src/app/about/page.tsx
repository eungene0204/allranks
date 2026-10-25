import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { allRankings, countryCodes } from "@/lib/data";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = pageMetadata('About', 'What AllRanks is, where its numbers come from and how to reach us.', '/about');

export default function AboutPage() {
  const all = allRankings();
  const world = all.filter((r) => !r.scope).length;
  return (
    <>
      <div className="page-head">
        <h1>About AllRanks</h1>
        <p>One place to see how countries compare on almost anything.</p>
      </div>
      <div className="prose">
        <p>
          AllRanks brings rankings from around the world together: {world} world rankings plus {all.length - world} country-level
          ones (regions, cities, universities, tall buildings, airports), covering {countryCodes().length} countries. Pick a country on the globe
          to see where it stands, or browse a category from the menu.
        </p>

        <h2>Where the numbers come from</h2>
        <p>
          We do not make up statistics. Each ranking is collected from a public source — the World Bank, Our World in Data, Epoch AI, OpenAlex,
          national statistics offices and tables in Wikipedia — and the page shows that source, its licence and the date we fetched it.
          Supported collectors can refresh snapshots; availability and update timing differ by source. Read <Link href="/methodology">how we collect and check data</Link>, including the checks required before manually or AI-collected lists can be published.
        </p>

        <h2>What AllRanks is not</h2>
        <p>
          A ranking is a simplification. Definitions differ between countries and sources, some figures are estimates, and the years behind
          the numbers are shown on every page. Please check the original source before relying on a figure for a decision.
        </p>

        <h2>Who maintains AllRanks</h2>
        <p>AllRanks is responsible for maintaining the collection and correcting its presentation. The AllRanks assistant prepares the source-backed reading guides using AI assistance; we do not claim expert or laboratory review. Manual and AI-collected lists require comparison with their linked sources before publication. Original data remain attributed to their publishers.</p>
        <h2>What we add</h2><p>Explore country profiles, compare two entries within a dataset, inspect supported annual histories and use our <Link href="/guides">reading guides</Link> to distinguish economic size from living standards, inflation from price levels, and research metrics from teaching quality. The tools show what the listed data support and where a comparison stops.</p>
        <p>Read our <Link href="/editorial-policy">editorial policy and correction process</Link>. Rankings describe specific measures; we do not combine unrelated positions into an overall country score.</p>
        <h2 id="contact">Contact &amp; corrections</h2>
        <p>
          Found a wrong number, a broken link or a ranking you would like to see?{" "}
          {CONTACT_EMAIL ? <>Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</> : <>Contact details will be added here.</>}
        </p>
      </div>
    </>
  );
}

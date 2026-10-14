import type { Metadata } from "next";
import Link from "next/link";
import { allRankings, countryCodes } from "@/lib/data";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "What AllRanks is, where its numbers come from and how to reach us.",
};

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
          We do not make up statistics. Each ranking is read from an open source — the World Bank, Our World in Data, Epoch AI, OpenAlex,
          national statistics offices and tables in Wikipedia — and the page shows that source, its licence and the date we fetched it.
          Most rankings refresh automatically. Read <Link href="/methodology">how we collect and check data</Link>, including what “AI-collected · unverified” means.
        </p>

        <h2>What AllRanks is not</h2>
        <p>
          A ranking is a simplification. Definitions differ between countries and sources, some figures are estimates, and the years behind
          the numbers are shown on every page. Please check the original source before relying on a figure for a decision.
        </p>

        <h2>Contact</h2>
        <p>
          Found a wrong number, a broken link or a ranking you would like to see?{" "}
          {CONTACT_EMAIL ? <>Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</> : <>Contact details will be added here.</>}
        </p>
      </div>
    </>
  );
}

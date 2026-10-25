import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("World rankings", "Compare countries across universities, GDP, prices and more. Explore rankings with original sources and reference years.", "/");

import FooterFaq from "@/components/FooterFaq";
import ReadingGuideCards from "@/components/ReadingGuideCards";
import SearchForm from "@/components/SearchForm";
import GlobeExplorer from "@/components/GlobeExplorer";
import RandomRankingCards from "@/components/RandomRankingCards";
import { allRankings, countrySummaries } from "@/lib/data";
import { latestHomeRankings, popularHomeRankings } from "@/lib/home-rankings";
import Link from "next/link";
import { toRankingCard } from "@/lib/ranking-card";

export default function HomePage() {
  const countries = countrySummaries();
  const all = allRankings();
  // Country-specific rankings (US states…) live on their country page; the home page shows the world ones.
  const rankings = all.filter((r) => !r.scope);
  const latestRankings = latestHomeRankings(rankings);
  const popularRankings = popularHomeRankings(rankings);
  return (
    <>
      <section className="hero center home-hero" aria-labelledby="home-headline">
        <div className="hero-data-label">
          <span><b>{all.length.toLocaleString("en-US")}</b> total rankings</span>
          <span className="hero-data-divider" aria-hidden="true" />
          <span><b>{countries.length}</b> countries</span>
        </div>
        <h1 id="home-headline">
          <span className="hero-headline-line">No country tops</span>{" "}
          <em>everything<span className="hero-period">.</span></em>
        </h1>
        <p>From universities to GDP, fuel to Big Macs.<br className="hero-copy-break" /> Discover where each country stands.</p>
        <div className="hero-explore-cue" aria-hidden="true">
          <span>One world. A thousand perspectives.</span>
          <span className="hero-cue-line" />
        </div>
      </section>

      <GlobeExplorer countries={countries.map(({ appearances, regional, ...country }) => ({
        ...country,
        appearanceCount: appearances.length,
        appearances: appearances.slice(0, 6),
        leadCount: appearances.filter((a) => a.rank === 1).length,
        leads: appearances.filter((a) => a.rank === 1).slice(0, 3),
        regionalCount: regional.length,
        regionalIcons: regional.slice(0, 8).map((r) => r.icon),
      }))} />

      <SearchForm />

      <ReadingGuideCards limit={3} />

      <h2 className="section">LATEST</h2>
      <RandomRankingCards rankings={latestRankings.map(toRankingCard)} shuffle={false} />

      <h2 className="section">Popular rankings</h2>
      <RandomRankingCards rankings={popularRankings.slice(0, 15).map(toRankingCard)} limit={15} rerollOnRestore className="popular-ranking-cards" />
      {popularRankings.length > 15 && (
        <div className="more-rankings">
          <Link className="more-rankings-link" href="/popular">More</Link>
        </div>
      )}
      <FooterFaq />
    </>
  );
}

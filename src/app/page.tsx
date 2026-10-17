import SearchForm from "@/components/SearchForm";
import GlobeExplorer from "@/components/GlobeExplorer";
import RandomRankingCards from "@/components/RandomRankingCards";
import { allRankings, countrySummaries } from "@/lib/data";
import { latestHomeRankings, popularHomeRankings } from "@/lib/home-rankings";
import Link from "next/link";

export default function HomePage() {
  const countries = countrySummaries();
  const all = allRankings();
  // Country-specific rankings (US states…) live on their country page; the home page shows the world ones.
  const rankings = all.filter((r) => !r.scope);
  const latestRankings = latestHomeRankings(rankings);
  const popularRankings = popularHomeRankings(rankings);
  return (
    <>
      <section className="hero center">
        <span className="pill">
          <b>{all.length}</b> total rankings · <b>{countries.length}</b> countries
        </span>
        <h1>
          No country tops everything.
        </h1>
        <p>From universities to GDP, fuel to Big Macs — discover where each country stands.</p>
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

      <h2 className="section">LATEST</h2>
      <RandomRankingCards rankings={latestRankings} shuffle={false} />

      <h2 className="section">Popular rankings</h2>
      <RandomRankingCards rankings={popularRankings} limit={10} rerollOnRestore />
      {popularRankings.length > 10 && (
        <div className="more-rankings">
          <Link className="more-rankings-link" href="/popular">More</Link>
        </div>
      )}
    </>
  );
}

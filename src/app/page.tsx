import SearchForm from "@/components/SearchForm";
import GlobeExplorer from "@/components/GlobeExplorer";
import RandomRankingCards from "@/components/RandomRankingCards";
import { allRankings, countrySummaries } from "@/lib/data";

export default function HomePage() {
  const countries = countrySummaries();
  // Country-specific rankings (US states…) live on their country page; the home page shows the world ones.
  const rankings = allRankings().filter((r) => !r.scope);
  const currentYear = new Date().getFullYear();
  const latestRankings = rankings
    .filter((ranking) => ranking.year === currentYear)
    .sort((a, b) => b.year - a.year || (b.asOf ?? "").localeCompare(a.asOf ?? "") || b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);
  const latestIds = new Set(latestRankings.map((ranking) => ranking.id));
  const popularRankings = rankings.filter((ranking) => !latestIds.has(ranking.id));
  return (
    <>
      <section className="hero center">
        <span className="pill">
          <b>{rankings.length}</b> rankings · <b>{countries.length}</b> countries
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
      <RandomRankingCards rankings={popularRankings} />
    </>
  );
}

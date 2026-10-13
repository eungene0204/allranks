import SearchForm from "@/components/SearchForm";
import GlobeExplorer from "@/components/GlobeExplorer";
import RankingCard from "@/components/RankingCard";
import { allRankings, countrySummaries } from "@/lib/data";

export default function HomePage() {
  const countries = countrySummaries();
  // Country-specific rankings (US states…) live on their country page; the home page shows the world ones.
  const rankings = allRankings().filter((r) => !r.scope);
  return (
    <>
      <section className="hero center">
        <span className="pill">
          <b>{rankings.length}</b> rankings · <b>{countries.length}</b> countries
        </span>
        <h1>
          Every ranking in the world, <em>in one place.</em>
        </h1>
        <p>Universities, GDP, fuel prices, Big Mac prices and more — see which countries lead them all.</p>
      </section>

      <GlobeExplorer countries={countries} />

      <SearchForm />

      <h2 className="section">Popular rankings</h2>
      <div className="cards">
        {rankings.map((r) => (
          <RankingCard key={r.id} ranking={r} />
        ))}
      </div>
    </>
  );
}

import type { Ranking } from "./types";

// Editorially selected high-interest, easy-to-compare topics; the site has no page-view analytics.
const POPULAR_RANKING_IDS = new Set([
  "big-mac",
  "billionaires",
  "corruption-perceptions",
  "gdp-growth",
  "gdp-nominal",
  "gdp-per-capita",
  "happiness",
  "inflation",
  "internet-speed-fixed",
  "internet-speed-mobile",
  "internet-users",
  "largest-cities",
  "largest-companies",
  "math-scores",
  "military-spending",
  "millionaires",
  "nobel-laureates",
  "oil-production",
  "population",
  "pet-cat-ownership",
  "pet-dog-ownership",
  "press-freedom-index",
  "qs-universities",
  "renewable-electricity",
  "stock-market-cap",
  "tallest-buildings",
  "top-websites",
  "unemployment",
  "gasoline",
]);

// Recently added editions may be useful on /latest even when their source data is historical.
const RECENTLY_ADDED_LATEST_IDS = new Set(["ivy-league-admission-rates-2022"]);

export function allLatestRankings(rankings: Ranking[], year = new Date().getFullYear()): Ranking[] {
  return rankings
    // A ranking for next year's edition can be published during the current year.
    .filter((ranking) => {
      const publicationYear = ranking.editionYear ?? ranking.year;
      return publicationYear === year || (ranking.editionYear === year + 1 && ranking.source.verified) || RECENTLY_ADDED_LATEST_IDS.has(ranking.id);
    })
    .sort((a, b) => Number(Boolean(b.editionYear)) - Number(Boolean(a.editionYear)) || (b.asOf ?? "").localeCompare(a.asOf ?? "") || b.updatedAt.localeCompare(a.updatedAt));
}

export function latestHomeRankings(rankings: Ranking[], year = new Date().getFullYear()): Ranking[] {
  const mostRecentlyAdded = [...rankings]
    .filter((ranking) => !ranking.scope)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const currentEditions = allLatestRankings(rankings, year);
  return [...new Map([...(mostRecentlyAdded ? [mostRecentlyAdded] : []), ...currentEditions].map((ranking) => [ranking.id, ranking])).values()].slice(0, 3);
}

export function popularHomeRankings(rankings: Ranking[], year = new Date().getFullYear()): Ranking[] {
  const latestIds = new Set(latestHomeRankings(rankings, year).map((ranking) => ranking.id));
  return rankings.filter((ranking) => POPULAR_RANKING_IDS.has(ranking.id) && !latestIds.has(ranking.id));
}

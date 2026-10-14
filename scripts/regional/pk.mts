import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Pakistan — provinces, cities, airports.

const rankings: Pipeline[] = [
  rank("PK", "province-gdp", {
    kind: "gdp", title: "Pakistani Provinces by GDP",
    desc: "Estimated gross state product of each province and region, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("PK", {
    page: "List of Pakistani administrative units by gross state product", find: ["Administrative unit", "GSP (Billions USD)"], name: 0, value: num(1), drop: /^Pakistan/,
    year: 2026, by: "Pakistan Bureau of Statistics and provincial estimates", min: 5,
  })),
  rank("PK", "cities", {
    kind: "cities", title: "Largest Cities in Pakistan",
    desc: "The 100 most populous Pakistani cities at the 2023 census.",
    unit: "people",
  }, fromTable("PK", {
    page: "List of cities in Pakistan by population", find: ["City", "Pop. (2023 census)", "Province"], name: 0, value: num(1), detail: 4,
    year: 2023, by: "Pakistan Bureau of Statistics, 2023 census", limit: 100,
  })),
  rank("PK", "airports", {
    kind: "airports", title: "Busiest Airports in Pakistan",
    desc: "Pakistani airports ranked by passengers in fiscal year 2024–25.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("PK", {
    page: "List of the busiest airports in Pakistan", find: ["Rank (2024/2025)", "Airport", "IATA Code"], name: 1, value: num(4), detail: 2, scale: 1e-6,
    year: 2025, by: "Pakistan Civil Aviation Authority (FY2024–25)", limit: 20,
  })),
];
export default rankings;

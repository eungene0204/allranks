import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Australia — states and territories, cities, skyscrapers, airports, companies.

const GSP = { page: "List of Australian states and territories by gross state product" } as const;

const rankings: Pipeline[] = [
  rank("AU", "state-population", {
    kind: "population", title: "Australian States by Population",
    desc: "Estimated resident population of the six states and the mainland territories.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("AU", {
    page: "States and territories of Australia", find: ["State", "ISO", "Capital", "Population (Mar 2026)"], name: 1, value: num(4), scale: 1e-6,
    year: 2026, by: "Australian Bureau of Statistics, estimated resident population (March 2026)", min: 6,
  })),
  rank("AU", "state-gdp", {
    kind: "gdp", title: "Australian States by GDP",
    desc: "Gross state product in 2024–25, in billions of Australian dollars.",
    unit: "AUD billion", prefix: "A$", suffix: "B", decimals: 0,
  }, fromTable("AU", {
    ...GSP, find: ["State or territory", "Annual Growth Rate", "GSP (million $AUD"], name: 0, value: num(2), scale: 1e-3, drop: /^Australia \(/,
    year: 2025, by: "Australian Bureau of Statistics, Australian National Accounts: State Accounts", min: 8,
  })),
  rank("AU", "state-gdp-per-capita", {
    kind: "gdp-pc", title: "Australian States by GDP per Capita",
    desc: "Gross state product per resident in 2024–25, in Australian dollars.",
    unit: "AUD per person", prefix: "A$",
  }, fromTable("AU", {
    ...GSP, find: ["State or territory", "GSP per capita (A$", "ratio"], name: 0, value: num(1), drop: /^Australia \(/,
    year: 2025, by: "Australian Bureau of Statistics, Australian National Accounts: State Accounts", min: 8,
  })),
  rank("AU", "cities", {
    kind: "cities", title: "Largest Cities in Australia",
    desc: "Significant urban areas ranked by estimated resident population (June 2025).",
    unit: "people",
  }, fromTable("AU", {
    page: "List of cities in Australia by population", find: ["Rank", "Significant Urban Area", "State or territory"], name: 1, value: num(3), detail: 2, header: 2,
    year: 2025, by: "Australian Bureau of Statistics, estimated resident population (June 2025)", limit: 100,
  })),
  rank("AU", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Australia",
    desc: "The tallest completed buildings in Australia, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("AU", {
    page: "List of tallest buildings in Australia", find: ["Rank", "Name", "Image", "Location", "Height: m (ft)", "Floors"], name: 1, value: heightLead, detail: 3, header: 2,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("AU", "airports", {
    kind: "airports", title: "Busiest Airports in Australia",
    desc: "Airports ranked by revenue passengers in 2024–25.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("AU", {
    page: "List of the busiest airports in Australia", find: ["Rank (2024–25)", "Airport", "Total revenue passengers"], name: 1, value: num(5), detail: 2, scale: 1e-6,
    year: 2025, by: "Bureau of Infrastructure and Transport Research Economics (2024–25)", limit: 40,
  })),
  rank("AU", "companies", {
    kind: "companies", title: "Largest Companies in Australia",
    desc: "The biggest Australian companies by revenue (Forbes Global 2000, 2024 list).",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("AU", {
    page: "List of largest companies in Australia", find: ["Forbes 2000 rank", "Revenue (billions US$)"], name: 2, value: num(4), detail: 8,
    year: 2024, by: "Forbes Global 2000 (2024)", limit: 40,
  })),
];
export default rankings;

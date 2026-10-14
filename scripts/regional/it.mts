import { heightPair, fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Italy — regions, comuni, skyscrapers, airports.

const rankings: Pipeline[] = [
  rank("IT", "region-gdp", {
    kind: "gdp", title: "Italian Regions by GDP",
    desc: "Gross domestic product of each region in 2019, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 0,
  }, fromTable("IT", {
    page: "List of Italian regions by GDP", find: ["Region", "2019", "% of nationwide 2019 GDP"], name: 1, value: num(4), drop: /^Italy$/,
    year: 2019, by: "ISTAT, regional accounts (2019)", min: 15,
  })),
  rank("IT", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "Italian Regions by GDP per Capita",
    desc: "Economic output per resident of each region in 2023, in euros.",
    unit: "EUR per person", prefix: "€",
  }, fromTable("IT", {
    page: "List of Italian regions by GDP", find: ["Rank", "Region", "2023", "% of nationwide average"], name: 1, value: num(2),
    year: 2023, by: "ISTAT, regional accounts (2023)", min: 15,
  })),
  rank("IT", "cities", {
    kind: "cities", title: "Largest Cities in Italy",
    desc: "The 100 most populous Italian comuni (2026 estimate).",
    unit: "people",
  }, fromTable("IT", {
    page: "List of cities in Italy by population", find: ["Rank", "City", "Population", "Region"], name: 1, value: num(3), detail: (r) => r[r.length - 1], header: 2,
    tidy: (n) => n.replace(/\s*\(.*\)$/, ""), drop: /^Italy$/, year: 2026, by: "ISTAT, resident population", limit: 100,
  })),
  rank("IT", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Italy",
    desc: "The tallest completed buildings in Italy, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("IT", {
    page: "List of tallest buildings in Italy", find: ["Rank", "Photo", "Name", "City", "Height (m)"], name: 2, value: heightPair, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("IT", "airports", {
    kind: "airports", title: "Busiest Airports in Italy",
    desc: "Italian airports ranked by passengers in 2025.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("IT", {
    page: "List of the busiest airports in Italy", find: ["Annual % change"], name: 1, value: num(3), detail: 2, scale: 1e-6,
    year: 2025, by: "Assaeroporti, Italian airport statistics (2025)", limit: 40,
  })),
];
export default rankings;

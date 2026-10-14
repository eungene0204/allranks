import { afterYear, dedupeRomaji, fromTable, heightOf, nameCell, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Japan — prefectures, cities, skyscrapers, airports, companies.

const prefecture = (n: string) => n.replace(/^Tōkyō-to$|^Tokyo-to$/, "Tokyo").replace(/-(to|ken|fu)$/, "").replace(/^Ōsaka$/, "Osaka");

const rankings: Pipeline[] = [
  rank("JP", "prefecture-population", {
    kind: "population", title: "Japanese Prefectures by Population",
    desc: "Resident population of the 47 prefectures at the 2025 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("JP", {
    page: "List of Japanese prefectures by population", find: ["Rank", "Prefecture", "2025"], name: 1, value: num(5), scale: 1e-6,
    drop: /^Japan$/, tidy: prefecture, year: 2025, by: "Statistics Bureau of Japan, 2025 population census", min: 40,
  })),
  rank("JP", "prefecture-gdp", {
    kind: "gdp", title: "Japanese Prefectures by GDP",
    desc: "Prefectural gross domestic product in current US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 0,
  }, fromTable("JP", {
    page: "List of Japanese prefectures by GDP", find: ["Rank", "Prefecture", "2022 GDP (in millions of US$)"], name: 1, value: num(4), scale: 1e-3,
    drop: /^(Japan|Prefecture)$/, tidy: prefecture, year: 2022, by: "Cabinet Office of Japan, prefectural accounts (2022)", min: 40,
  })),
  rank("JP", "cities", {
    kind: "cities", title: "Largest Cities in Japan",
    desc: "The 100 most populous cities in Japan.",
    unit: "people",
  }, fromTable("JP", {
    page: "List of cities in Japan", find: ["City", "Prefecture", "Population", "Density"], name: 0, value: num(3), detail: 2,
    drop: /^Tokyo Ward/, tidy: (n) => (n === "Tokyo Ward AATokyo" ? "Tokyo" : dedupeRomaji(n)), year: 2020, by: "Statistics Bureau of Japan", limit: 100, min: 50,
  })),
  rank("JP", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Japan",
    desc: "The tallest completed structures in Japan, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("JP", {
    page: "List of tallest buildings in Japan", find: ["Rank", "Name", "Floors", "Year", "City"], name: 1, value: num(3), detail: (r) => r[7],
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("JP", "airports", {
    kind: "airports", title: "Busiest Airports in Japan",
    desc: "Airports ranked by passengers handled.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("JP", {
    page: "List of the busiest airports in Japan", find: ["Rank", "Airport", "% chg"], name: 1, value: num(5), detail: 2, scale: 1e-6, header: 2,
    year: 2022, by: "Ministry of Land, Infrastructure, Transport and Tourism (FY2022)",
  })),
  rank("JP", "companies", {
    kind: "companies", title: "Largest Companies in Japan",
    desc: "The biggest Japanese companies by revenue (Fortune Global 500).",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("JP", {
    page: "List of largest companies in Japan", find: ["Fortune 500 rank", "Revenue (USD millions)"], name: 2, value: num(4), detail: 3, scale: 1e-3,
    year: 2022, by: "Fortune Global 500 (2022)", note: "Wikipedia's most recent Japanese company table is the 2022 Fortune list.",
  })),
];

export default rankings;

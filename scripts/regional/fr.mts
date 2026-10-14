import { fromTable, heightOf, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// France — regions, communes, skyscrapers.

const GDP = { page: "List of French regions and overseas collectivities by GDP", find: ["Rank", "Region", "GDP(millions of euros"] } as const;

const rankings: Pipeline[] = [
  rank("FR", "region-gdp", {
    kind: "gdp", title: "French Regions by GDP",
    desc: "Nominal GDP of each region, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 0,
  }, fromTable("FR", { ...GDP, name: 1, value: num(2), scale: 1e-3, year: 2025, by: "INSEE, regional accounts (2025)", min: 10 })),
  rank("FR", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "French Regions by GDP per Capita",
    desc: "Nominal GDP per resident of each region, in euros.",
    unit: "EUR per person", prefix: "€",
  }, fromTable("FR", { ...GDP, name: 1, value: num(3), year: 2025, by: "INSEE, regional accounts (2025)", min: 10 })),
  rank("FR", "cities", {
    kind: "cities", title: "Largest Communes in France",
    desc: "The 100 most populous French communes at the 2023 estimate.",
    unit: "people",
  }, fromTable("FR", {
    page: "List of communes in France with over 20,000 inhabitants", find: ["Commune", "Department", "Region", "Rank, 2023"], name: 0, value: num(5), detail: 1,
    year: 2023, by: "INSEE, population légale (2023)", limit: 100,
  })),
  rank("FR", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in France",
    desc: "The tallest completed buildings in France, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("FR", {
    page: "List of tallest buildings in France", find: ["Rank", "Name", "Height metres / feet", "Floors", "Year"], name: 1, value: (r) => heightOf(r.slice(2)), detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

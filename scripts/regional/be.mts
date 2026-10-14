import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Belgium — provinces, skyscrapers.

const rankings: Pipeline[] = [
  rank("BE", "province-gdp", {
    kind: "gdp", title: "Belgian Provinces by GDP",
    desc: "Nominal GDP of the ten provinces and the Brussels-Capital Region in 2021, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 1,
  }, fromTable("BE", {
    page: "List of Belgian provinces by GDP", find: ["Rank", "Province", "GDP in bn. EUR"], name: 1, value: num(2), scale: 1e-3,
    year: 2021, by: "Eurostat, regional accounts (2021)", min: 8,
  })),
  rank("BE", "province-gdp-per-capita", {
    kind: "gdp-pc", title: "Belgian Provinces by GDP per Capita",
    desc: "Nominal GDP per resident in 2021, in euros.",
    unit: "EUR per person", prefix: "€",
  }, fromTable("BE", {
    page: "List of Belgian provinces by GDP", find: ["Rank", "Province", "GDP per capita in EUR"], name: 1, value: num(2),
    year: 2021, by: "Eurostat, regional accounts (2021)", min: 8,
  })),
  rank("BE", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Belgium",
    desc: "The tallest completed buildings in Belgium, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("BE", {
    page: "List of tallest buildings in Belgium", find: ["Rank", "Name", "Place", "Height", "Floors", "Year"], name: 1, value: heightLead, detail: 2, keep: (r) => !/\d\s*m\b/.test(r[2] ?? ""),
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

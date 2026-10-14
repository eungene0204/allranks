import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// New Zealand — regions, urban areas, skyscrapers.

const R = { page: "List of regions of New Zealand by GDP", find: ["Region", "GDP (NZ$ billion)", "GDP (US$ billion)"], drop: /^(New Zealand|North Island|South Island)$/, year: 2024, by: "Stats NZ, regional gross domestic product (year to March 2024)", min: 12 } as const;

const rankings: Pipeline[] = [
  rank("NZ", "region-gdp", {
    kind: "gdp", title: "New Zealand Regions by GDP",
    desc: "Gross domestic product of each region in the year to March 2024, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("NZ", { ...R, name: 0, value: num(2) })),
  rank("NZ", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "New Zealand Regions by GDP per Capita",
    desc: "Gross domestic product per resident, in US dollars.",
    unit: "USD per person", prefix: "$",
  }, fromTable("NZ", { ...R, name: 0, value: num(4) })),
  rank("NZ", "cities", {
    kind: "cities", title: "Largest Urban Areas in New Zealand",
    desc: "Major and large urban areas ranked by estimated population.",
    unit: "people",
  }, fromTable("NZ", {
    page: "List of cities in New Zealand", find: ["Rank", "Urban area", "Population", "Population density"], name: 1, value: num(2),
    year: 2024, by: "Stats NZ, subnational population estimates", limit: 30,
  })),
  rank("NZ", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in New Zealand",
    desc: "The tallest completed structures in New Zealand, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("NZ", {
    page: "List of tallest buildings in New Zealand", find: ["Rank", "Name", "Image", "City", "Height", "Floors", "Year"], name: 1, value: heightLead, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

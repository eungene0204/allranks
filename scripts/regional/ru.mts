import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Russia — federal subjects, cities, skyscrapers, airports.

const GRDP = { page: "List of Russian federal subjects by GRDP", find: ["Rank (2024)", "Federal subject", "(billion USD)"] } as const;

const rankings: Pipeline[] = [
  rank("RU", "region-population", {
    kind: "population", title: "Russian Regions by Population",
    desc: "Estimated population of the federal subjects (2025).",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("RU", {
    page: "List of federal subjects of Russia by population", find: ["Federal subject", "Type", "2025 estimate", "2021 Census"], name: 0, value: num(2), scale: 1e-6,
    drop: /^Russian Federation$/, year: 2025, by: "Rosstat, population estimates (2025)", min: 60,
  })),
  rank("RU", "region-gdp", {
    kind: "gdp", title: "Russian Regions by GDP",
    desc: "Gross regional product of each federal subject in 2024, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("RU", { ...GRDP, name: 1, value: num(4), drop: /^Russian Federation$/, year: 2024, by: "Rosstat, gross regional product (2024)", min: 60 })),
  rank("RU", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "Russian Regions by GDP per Capita",
    desc: "Gross regional product per resident in 2024, in US dollars.",
    unit: "USD per person", prefix: "$",
  }, fromTable("RU", { ...GRDP, name: 1, value: num(6), drop: /^Russian Federation$/, year: 2024, by: "Rosstat, gross regional product (2024)", min: 60 })),
  rank("RU", "cities", {
    kind: "cities", title: "Largest Cities in Russia",
    desc: "The 100 most populous Russian cities at the 2021 census.",
    unit: "people",
  }, fromTable("RU", {
    page: "List of cities and towns in Russia by population", find: ["City or town", "Russian name", "Federal subject", "2021 census"], name: 0, value: num(4),
    detail: (r) => r[2].replace(/\s*\(.*\)$/, ""), year: 2021, by: "Rosstat, 2021 census", limit: 100,
  })),
  rank("RU", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Russia",
    desc: "The tallest completed buildings and towers in Russia, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("RU", {
    page: "List of tallest buildings in Russia", find: ["Rank", "Name", "Image", "Height m (ft)", "Floors", "Location"], name: 1, value: heightLead,
    detail: (r) => (r[r.length - 2] ?? "").replace(/\s*\d.*$/, ""),
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("RU", "airports", {
    kind: "airports", title: "Busiest Airports in Russia",
    desc: "Russian airports ranked by passengers in 2024.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("RU", {
    page: "List of the busiest airports in Russia", find: ["Rank", "Airport", "Region", "Passengers 2024"], name: 1, value: num(6), detail: 3, scale: 1e-6,
    year: 2024, by: "Rosaviatsia (2024)", limit: 40,
  })),
];
export default rankings;

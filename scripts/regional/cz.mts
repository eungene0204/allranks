import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Czech Republic — regions, cities, skyscrapers.

const rankings: Pipeline[] = [
  rank("CZ", "region-gdp", {
    kind: "gdp", title: "Czech Regions by GDP",
    desc: "Gross domestic product of each region in 2022, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("CZ", {
    page: "List of Czech regions by GDP", find: ["Rank", "Region", "GDP in billions CZK"], name: 1, value: num(3), scale: 1e-3, drop: /^Czech/,
    year: 2022, by: "Czech Statistical Office (2022)", min: 12,
  })),
  rank("CZ", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "Czech Regions by GDP per Capita",
    desc: "Gross domestic product per resident in 2022, in US dollars.",
    unit: "USD per person", prefix: "$",
  }, fromTable("CZ", {
    page: "List of Czech regions by GDP", find: ["Rank", "Region", "GDP per capita in CZK"], name: 1, value: num(3), drop: /^Czech/,
    year: 2022, by: "Czech Statistical Office (2022)", min: 12,
  })),
  rank("CZ", "cities", {
    kind: "cities", title: "Largest Cities in the Czech Republic",
    desc: "The biggest Czech cities by population (2026).",
    unit: "people",
  }, fromTable("CZ", {
    page: "List of cities and towns in the Czech Republic", find: ["Name", "Population (2026)", "Region"], name: 0, value: num(1), detail: 2,
    year: 2026, by: "Czech Statistical Office (2026)", min: 15,
  })),
  rank("CZ", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in the Czech Republic",
    desc: "The tallest completed buildings in the Czech Republic, by pinnacle height.",
    unit: "metres", suffix: " m",
  }, fromTable("CZ", {
    page: "List of tallest buildings in the Czech Republic", find: ["Name", "City", "Pinnacle Height", "Floors", "Year built", "Use"], name: 0, value: num(2), detail: 1,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

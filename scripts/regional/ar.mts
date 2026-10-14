import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Argentina — provinces, skyscrapers, airports.

const D = { page: "List of Argentine regions by GDP", find: ["District", "Population", "GDP (bil. US$) 2023"] } as const;

const rankings: Pipeline[] = [
  rank("AR", "province-gdp", {
    kind: "gdp", title: "Argentine Provinces by GDP",
    desc: "Gross geographic product of each province and Buenos Aires city in 2023, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("AR", { ...D, name: 0, value: num(2), drop: /^Argentina$/, year: 2023, by: "INDEC and provincial statistics offices (2023)", min: 20 })),
  rank("AR", "province-gdp-per-capita", {
    kind: "gdp-pc", title: "Argentine Provinces by GDP per Capita",
    desc: "Gross geographic product per resident in 2023, in US dollars.",
    unit: "USD per person", prefix: "$",
  }, fromTable("AR", { ...D, name: 0, value: num(3), drop: /^Argentina$/, year: 2023, by: "INDEC and provincial statistics offices (2023)", min: 20 })),
  rank("AR", "province-population", {
    kind: "population", title: "Argentine Provinces by Population",
    desc: "Population of the provinces and Buenos Aires city.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("AR", { ...D, name: 0, value: num(1), drop: /^Argentina$/, scale: 1e-6, year: 2022, by: "INDEC, 2022 census", min: 20 })),
  rank("AR", "airports", {
    kind: "airports", title: "Busiest Airports in Argentina",
    desc: "Argentine airports ranked by total passengers in 2024.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("AR", {
    page: "List of the busiest airports in Argentina", find: ["Rank", "Airport", "Total passengers", "% change"], name: 1, value: num(3), detail: 2, scale: 1e-6,
    year: 2024, by: "ANAC / ORSNA, Argentine airport statistics (2024)", limit: 15,
  })),
  rank("AR", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Argentina",
    desc: "The tallest completed buildings in Argentina, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("AR", {
    page: "List of tallest buildings in Argentina", find: ["Rank", "Name", "Image", "Location", "Height m (ft)", "Floors"], name: 1,
    // The height cell carries a hidden sort key: "01.0235 (770)" is 235 m.
    value: (r) => Number(r[4]?.match(/^\d\d\.0(\d{3})\s*\(/)?.[1] ?? NaN), detail: (r) => r[3].replace(/\s*\d.*$/, ""),
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

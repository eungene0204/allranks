import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Thailand — regions, skyscrapers, airports.

const R = { page: "List of Thai provinces by GPP", find: ["ID", "Region", "GPP (billions ฿)", "GPP per capita (฿)"] } as const;

const rankings: Pipeline[] = [
  rank("TH", "region-gdp", {
    kind: "gdp", title: "Thai Regions by GDP",
    desc: "Gross provincial product of Thailand's regions, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("TH", { ...R, name: 1, value: num(5), drop: /^Thailand$/, year: 2022, by: "NESDC, gross regional and provincial product", min: 6 })),
  rank("TH", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "Thai Regions by GDP per Capita",
    desc: "Gross provincial product per resident, in US dollars.",
    unit: "USD per person", prefix: "$",
  }, fromTable("TH", { ...R, name: 1, value: num(8), drop: /^Thailand$/, year: 2022, by: "NESDC, gross regional and provincial product", min: 6 })),
  rank("TH", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Thailand",
    desc: "The tallest completed buildings in Thailand, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("TH", {
    page: "List of tallest buildings in Thailand", find: ["Rank", "Building", "Image", "City", "Height", "Floors", "Coordinates"], name: 1, value: num(4), detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("TH", "airports", {
    kind: "airports", title: "Busiest Airports in Thailand",
    desc: "Thai airports ranked by passengers in 2023.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("TH", {
    page: "List of the busiest airports in Thailand", find: ["#", "Airport name", "City Served", "2023(total)"], name: 1, value: num(4), detail: 2, scale: 1e-6, header: 2,
    year: 2023, by: "Airports of Thailand and Department of Airports (2023)", limit: 30,
  })),
];
export default rankings;

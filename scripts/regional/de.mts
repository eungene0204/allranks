import { bigNum, fromTable, heightPair, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Germany — states, cities, skyscrapers, airports.

const tidyState = (n: string) => n.replace(/\s*\(.*\)$/, "");

const rankings: Pipeline[] = [
  rank("DE", "state-population", {
    kind: "population", title: "German States by Population",
    desc: "Population of the 16 states at the end of 2023.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("DE", {
    page: "List of German states by population", find: ["State", "State code", "HDI"], name: 0, value: num(8), scale: 1e-6, tidy: tidyState,
    year: 2023, by: "Federal Statistical Office (Destatis), 31 Dec 2023", min: 15,
  })),
  rank("DE", "state-gdp", {
    kind: "gdp", title: "German States by GDP",
    desc: "Gross domestic product of each state, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 0,
  }, fromTable("DE", {
    page: "List of German states by GDP", find: ["States", "GDP (mil. €)"], name: 0, value: num(1), scale: 1e-3, drop: /^Germany$/,
    year: 2023, by: "Federal Statistical Office (Destatis)", min: 15,
  })),
  rank("DE", "state-gdp-per-capita", {
    kind: "gdp-pc", title: "German States by GDP per Capita",
    desc: "Economic output per resident of each state, in euros.",
    unit: "EUR per person", prefix: "€",
  }, fromTable("DE", {
    page: "List of German states by GDP", find: ["States", "GDP (mil. €)"], name: 0, value: num(2), drop: /^Germany$/,
    year: 2023, by: "Federal Statistical Office (Destatis)", min: 15,
  })),
  rank("DE", "cities", {
    kind: "cities", title: "Largest Cities in Germany",
    desc: "The 80 most populous German cities (2021 estimate).",
    unit: "people",
  }, fromTable("DE", {
    page: "List of cities in Germany by population", find: ["2021 rank", "City", "2021 estimate"], name: 1, value: bigNum(2),
    year: 2021, by: "Federal Statistical Office (Destatis)", limit: 100, min: 50,
  })),
  rank("DE", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Germany",
    desc: "The tallest completed buildings in Germany, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("DE", {
    page: "List of tallest buildings in Germany", find: ["Rank", "Name", "Height (m)", "Floors"], name: 1, value: heightPair, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("DE", "airports", {
    kind: "airports", title: "Busiest Airports in Germany",
    desc: "German airports ranked by passengers handled in 2025.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("DE", {
    page: "List of the busiest airports in Germany", find: ["Rank", "Airport", "IATA", "Change 2024-2025"], name: 1, value: (r) => Number(String(r[5]).replace(/\./g, "").replace(/,/g, "")), detail: 3, scale: 1e-6,
    year: 2025, by: "ADV (German Airports Association), 2025",
  })),
];

export default rankings;

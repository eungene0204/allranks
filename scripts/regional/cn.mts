import { afterYear, fromTable, heightOf, nameCell, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// China (mainland) — provincial-level divisions, cities, skyscrapers, airports, universities.

const rankings: Pipeline[] = [
  rank("CN", "universities", {
    kind: "universities", title: "Top Universities in China",
    desc: "Chinese universities by their position in the 2026 QS World University Rankings (lower is better).",
    unit: "world rank", order: "asc",
  }, fromTable("CN", {
    page: "Rankings of universities in China", find: ["Institution", "2026 World Ranking"], name: 0, value: num(1), asc: true,
    year: 2026, by: "QS World University Rankings 2026", limit: 100, min: 20,
    note: "Rank among all universities worldwide; ties share the same rank.",
  })),
  rank("CN", "province-gdp", {
    kind: "gdp", title: "Chinese Provinces by GDP",
    desc: "Nominal GDP of the provincial-level divisions of mainland China, in current US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 0,
  }, fromTable("CN", {
    page: "List of Chinese provincial-level divisions by GDP", find: ["region", "GDP(US$ mil.)"], name: 0, value: num(2), scale: 1e-3,
    drop: /^China/, year: 2025, by: "National Bureau of Statistics of China (2025)", min: 25,
  })),
  rank("CN", "province-population", {
    kind: "population", title: "Chinese Provinces by Population",
    desc: "Resident population of the provincial-level divisions of mainland China.",
    unit: "million people", suffix: "M", decimals: 1,
  }, fromTable("CN", {
    page: "List of Chinese administrative divisions by population", find: ["Division", "Region", "Total", "Urban"], name: 0, value: num(2), scale: 1e-6,
    drop: /^Mainland China$/, year: 2020, by: "National Bureau of Statistics of China", min: 25,
  })),
  rank("CN", "cities", {
    kind: "cities", title: "Largest Cities in China",
    desc: "The 100 most populous Chinese cities at the 2020 census.",
    unit: "people",
  }, fromTable("CN", {
    page: "List of cities in China by population", find: ["City", "Province", "2020 Census", "% change"], name: 0, value: num(2), detail: (r) => (r[1] === "municipality" ? "Municipality" : r[1]),
    year: 2020, by: "National Bureau of Statistics of China, 2020 census", limit: 100, min: 50,
  })),
  rank("CN", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in China",
    desc: "The tallest completed buildings in mainland China, by architectural height.",
    unit: "metres", suffix: " m",
  }, fromTable("CN", {
    page: "List of tallest buildings in China", find: ["Rank", "Name", "Chinese name", "Floors"], name: 1, value: (r) => heightOf(r.slice(4)), detail: 4,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("CN", "airports", {
    kind: "airports", title: "Busiest Airports in China",
    desc: "Mainland Chinese airports ranked by passengers handled.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("CN", {
    page: "List of the busiest airports in China", find: ["Rank", "Airport", "Province", "Passengers"], name: 1, value: num(5), detail: 2, scale: 1e-6,
    year: 2024, by: "Civil Aviation Administration of China", limit: 50,
  })),
];

export default rankings;

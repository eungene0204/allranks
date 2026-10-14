import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Uzbekistan — regions, cities.

const rankings: Pipeline[] = [
  rank("UZ", "region-population", {
    kind: "population", title: "Uzbek Regions by Population",
    desc: "Population of each region.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("UZ", {
    page: "Regions of Uzbekistan", find: ["Key", "Name", "Capital city", "Population (2026)"], name: 1, value: num(4), scale: 1e-6, tidy: (n) => n.replace(/ Region$/, ""),
    year: 2026, by: "Statistics Agency of Uzbekistan (2026)", min: 5,
  })),
  rank("UZ", "cities", {
    kind: "cities", title: "Largest Cities in Uzbekistan",
    desc: "Uzbek cities ranked by population (2024).",
    unit: "people",
  }, fromTable("UZ", {
    page: "List of cities in Uzbekistan", find: ["Rank", "City", "Population (2024)"], name: 1, value: num(2),
    year: 2024, by: "Statistics Agency of Uzbekistan (2024)", min: 10,
  })),
];
export default rankings;

import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Laos — provinces, cities.

const rankings: Pipeline[] = [
  rank("LA", "province-population", {
    kind: "population", title: "Lao Provinces by Population",
    desc: "Estimated population of each province and Vientiane Prefecture (mid-2023).",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("LA", {
    page: "Provinces of Laos", find: ["Location", "Name", "Capital", "Pop'n (mid 2023 estimate)"], name: 1, value: num(3), scale: 1e-6,
    tidy: (n) => n.replace(/ (province|prefecture)$/i, ""),
    year: 2023, by: "Lao Statistics Bureau (2023 estimate)", min: 15,
  })),
  rank("LA", "cities", {
    kind: "cities", title: "Largest Cities in Laos",
    desc: "Lao cities ranked by population.",
    unit: "people",
  }, fromTable("LA", {
    page: "List of cities in Laos", find: ["City", "Population", "Coordinates", "Province"], name: 0, value: num(1), detail: 3,
    year: 2015, by: "Lao Statistics Bureau, 2015 census", min: 10,
  })),
];
export default rankings;

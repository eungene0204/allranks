import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Mozambique — provinces.

const rankings: Pipeline[] = [
  rank("MZ", "province-population", {
    kind: "population", title: "Mozambican Provinces by Population",
    desc: "Population of each province at the 2017 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("MZ", {
    page: "Provinces of Mozambique", find: ["Map Key", "Province", "Capital", "Area (km)", "Population (2017 census)"], name: 1, value: num(5), scale: 1e-6, detail: 2,
    year: 2017, by: "National Institute of Statistics (INE), 2017 census", min: 10,
  })),
];
export default rankings;

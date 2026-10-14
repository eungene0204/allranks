import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Angola — provinces, cities.

const rankings: Pipeline[] = [
  rank("AO", "province-population", {
    kind: "population", title: "Angolan Provinces by Population",
    desc: "Population of each of Angola's provinces at the 2024 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("AO", {
    page: "Provinces of Angola", find: ["Location", "Province", "Capital", "Area (km)", "Population (2024)"], name: 1, value: num(4), scale: 1e-6, detail: 2,
    year: 2024, by: "National Institute of Statistics (INE), 2024 census", min: 15,
  })),
  rank("AO", "cities", {
    kind: "cities", title: "Largest Cities in Angola",
    desc: "Angolan cities and towns ranked by population (2014 census / 2018 estimate).",
    unit: "people",
  }, fromTable("AO", {
    page: "List of cities in Angola", find: ["Name of town or city", "Coordinates", "Pop. 2014/18", "Province"], name: 0, value: num(2), detail: 3, tidy: (n) => n.replace(/\s*\(.*$/, ""),
    year: 2018, by: "National Institute of Statistics (INE)", limit: 50, min: 30,
  })),
];
export default rankings;

import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Cameroon — regions, cities.

const rankings: Pipeline[] = [
  rank("CM", "region-population", {
    kind: "population", title: "Cameroonian Regions by Population",
    desc: "Estimated population of each of Cameroon's ten regions (2022).",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("CM", {
    page: "Regions of Cameroon", find: ["No.", "Region", "French name", "Capital", "Population (2022 est.)"], name: 1, value: num(5), scale: 1e-6, detail: 3,
    year: 2022, by: "National Institute of Statistics (INS), 2022 estimate", min: 8,
  })),
  rank("CM", "cities", {
    kind: "cities", title: "Largest Cities in Cameroon",
    desc: "Cameroonian cities ranked by projected population.",
    unit: "people",
  }, fromTable("CM", {
    page: "List of cities in Cameroon", find: ["City", "Region", "Population (2005 Census)", "Projected Population"], name: 0, value: num(3), detail: 1,
    year: 2015, by: "National Institute of Statistics (INS), projection", limit: 50, min: 30,
  })),
];
export default rankings;

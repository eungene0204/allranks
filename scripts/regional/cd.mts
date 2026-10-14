import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// DR Congo — provinces.

const rankings: Pipeline[] = [
  rank("CD", "province-population", {
    kind: "population", title: "Congolese Provinces by Population",
    desc: "Estimated population of each province (2019).",
    unit: "million people", suffix: "M", decimals: 1,
  }, fromTable("CD", {
    page: "Provinces of the Democratic Republic of the Congo", find: ["Map", "Province", "ISO 3166-2 Code", "Capital", "Population (2019)"], name: 1, value: num(5), scale: 1e-6, detail: 3,
    year: 2019, by: "Institut National de la Statistique (2019 estimate)", min: 20,
  })),
];
export default rankings;

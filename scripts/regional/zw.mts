import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Zimbabwe — provinces.

const rankings: Pipeline[] = [
  rank("ZW", "province-population", {
    kind: "population", title: "Zimbabwean Provinces by Population",
    desc: "Population of each province at the 2022 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("ZW", {
    page: "Provinces of Zimbabwe", find: ["Name", "Towns and cities", "Established", "Population (2022)"], name: 0, value: num(3), scale: 1e-6, header: 2,
    year: 2022, by: "Zimbabwe National Statistics Agency (ZIMSTAT), 2022 census", min: 8,
  })),
];
export default rankings;

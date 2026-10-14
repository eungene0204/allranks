import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Senegal — regions.

const rankings: Pipeline[] = [
  rank("SN", "region-population", {
    kind: "population", title: "Senegalese Regions by Population",
    desc: "Population of each region at the 2023 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("SN", {
    page: "Regions of Senegal", find: ["Region", "Capital", "Area (km)", "Population (2023 census)"], name: 0, value: num(3), scale: 1e-6, detail: 1,
    year: 2023, by: "ANSD, 2023 census", min: 10,
  })),
];
export default rankings;

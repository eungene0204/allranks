import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Ghana — regions.

const rankings: Pipeline[] = [
  rank("GH", "region-population", {
    kind: "population", title: "Ghanaian Regions by Population",
    desc: "Population of each of Ghana's 16 regions at the 2021 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("GH", {
    page: "Regions of Ghana", find: ["Region", "Capital", "Population (2021)", "Area"], name: 0, value: num(2), scale: 1e-6, detail: 1,
    year: 2021, by: "Ghana Statistical Service, 2021 census", min: 10,
  })),
];
export default rankings;

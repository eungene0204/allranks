import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Zambia — provinces.

const rankings: Pipeline[] = [
  rank("ZM", "province-population", {
    kind: "population", title: "Zambian Provinces by Population",
    desc: "Population of each province at the 2022 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("ZM", {
    page: "Provinces of Zambia", find: ["Province", "Capital", "Area (km)", "Population (2022)", "Density"], name: 0, value: num(3), scale: 1e-6, detail: 1, drop: /^Zambia$/,
    year: 2022, by: "Zambia Statistics Agency, 2022 census", min: 8,
  })),
];
export default rankings;

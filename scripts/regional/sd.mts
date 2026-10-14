import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Sudan — states.

const rankings: Pipeline[] = [
  rank("SD", "state-population", {
    kind: "population", title: "Sudanese States by Population",
    desc: "Population of each of Sudan's 18 states (2018 estimate).",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("SD", {
    page: "States of Sudan", find: ["Number on map", "Location", "Seal", "State name", "Population (2018)"], name: 3, value: num(8), scale: 1e-6, detail: 6, header: 2,
    year: 2018, by: "Central Bureau of Statistics (2018 estimate)", min: 15,
  })),
];
export default rankings;

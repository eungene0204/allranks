import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Timor-Leste — municipalities.

const rankings: Pipeline[] = [
  rank("TL", "municipality-population", {
    kind: "population", title: "Timor-Leste Municipalities by Population",
    desc: "Population of each municipality at the 2022 census.",
    unit: "people",
  }, fromTable("TL", {
    page: "Municipalities of East Timor", find: ["Municipality", "Capital", "Established", "Area", "Population (2022)"], name: 0, value: num(4), detail: 1,
    year: 2022, by: "General Directorate of Statistics, 2022 census", min: 10,
  })),
];
export default rankings;

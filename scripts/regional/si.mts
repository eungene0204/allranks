import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Slovenia — cities.

const rankings: Pipeline[] = [
  rank("SI", "cities", {
    kind: "cities", title: "Largest Cities in Slovenia",
    desc: "Slovenian cities and towns ranked by population (2026).",
    unit: "people",
  }, fromTable("SI", {
    page: "List of cities and towns in Slovenia", find: ["Rank", "Name", "Population", "Traditional region"], name: 1, value: num(2), detail: 3, header: 2,
    year: 2026, by: "Statistical Office of the Republic of Slovenia (2026)", limit: 60, min: 30,
  })),
];
export default rankings;

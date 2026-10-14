import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Latvia — cities.

const rankings: Pipeline[] = [
  rank("LV", "cities", {
    kind: "cities", title: "Largest Cities in Latvia",
    desc: "Latvian cities ranked by population (2025).",
    unit: "people",
  }, fromTable("LV", {
    page: "List of cities and towns in Latvia", find: ["City", "Population (2013)", "Population (2019)", "Population (2025)"], name: 0, value: num(3),
    tidy: (n) => n.replace(/\s*pronunciation.*$/, ""), year: 2025, by: "Central Statistical Bureau of Latvia (2025)", min: 8,
  })),
];
export default rankings;

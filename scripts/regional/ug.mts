import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Uganda — cities and towns.

const rankings: Pipeline[] = [
  rank("UG", "cities", {
    kind: "cities", title: "Largest Cities in Uganda",
    desc: "Ugandan cities and towns ranked by population at the 2014 census.",
    unit: "people",
  }, fromTable("UG", {
    page: "List of cities and towns in Uganda", find: ["Rank", "Name", "2014 Census", "Coordinates"], name: 1, value: num(2),
    year: 2014, by: "Uganda Bureau of Statistics (UBOS), 2014 census", min: 10,
  })),
];
export default rankings;

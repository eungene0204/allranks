import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Malta — local councils.

const rankings: Pipeline[] = [
  rank("MT", "localities", {
    kind: "cities", title: "Largest Localities in Malta",
    desc: "Maltese local councils ranked by population at the 2021 census.",
    unit: "people",
  }, fromTable("MT", {
    page: "Local councils of Malta", find: ["Flag", "English name", "Maltese name", "Island", "Statistical District"], name: 1, value: num(-1),
    year: 2021, by: "National Statistics Office Malta (NSO), 2021 census", limit: 50, min: 30,
  })),
];
export default rankings;

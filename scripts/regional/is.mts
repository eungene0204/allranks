import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Iceland — municipalities.

const rankings: Pipeline[] = [
  rank("IS", "municipalities", {
    kind: "cities", title: "Largest Municipalities in Iceland",
    desc: "Icelandic municipalities by population at the 2021 census.",
    unit: "people",
  }, fromTable("IS", {
    page: "Municipalities of Iceland", find: ["Vernacular name", "Official name", "Region", "Population"], name: 0, value: num(3), detail: 2,
    year: 2021, by: "Statistics Iceland, 2021 census", limit: 60, min: 30,
  })),
];
export default rankings;

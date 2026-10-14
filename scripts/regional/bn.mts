import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Brunei — mukims.

const rankings: Pipeline[] = [
  rank("BN", "mukim-population", {
    kind: "population", title: "Brunei Mukims by Population",
    desc: "Population of each mukim (subdistrict) at the 2021 census.",
    unit: "people",
  }, fromTable("BN", {
    page: "Mukims of Brunei", find: ["Mukim", "District", "Population (2021)"], name: 0, value: num(-1),
    year: 2021, by: "Department of Economic Planning and Statistics (DEPS), 2021 census", limit: 40, min: 20,
  })),
];
export default rankings;

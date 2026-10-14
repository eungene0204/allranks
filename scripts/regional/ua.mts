import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Ukraine — oblasts.

const rankings: Pipeline[] = [
  rank("UA", "oblast-population", {
    kind: "population", title: "Ukrainian Oblasts by Population",
    desc: "Population of the oblasts before the full-scale invasion (2022 estimate).",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("UA", {
    page: "List of Ukrainian oblasts and territories by population", find: ["Ranking", "Oblast", "Population (2022)"], name: 1, value: num(2), scale: 1e-6,
    tidy: (n) => n.replace(/ Oblast$/, ""), drop: /^Ukraine$/, year: 2022, by: "State Statistics Service of Ukraine (2022 estimate)", min: 20,
    note: "Pre-war estimate; it does not reflect displacement since 2022.",
  })),
];
export default rankings;

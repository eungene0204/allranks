import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Tanzania — cities, regions.

const rankings: Pipeline[] = [
  rank("TZ", "cities", {
    kind: "cities", title: "Largest Cities in Tanzania",
    desc: "Tanzanian cities ranked by population at the 2012 census.",
    unit: "people",
  }, fromTable("TZ", {
    page: "List of cities in Tanzania", find: ["Rank", "City", "1978", "1999", "2002", "2012", "Region"], name: 1, value: num(5), detail: 6,
    year: 2012, by: "National Bureau of Statistics (NBS), 2012 census", min: 15,
  })),
  rank("TZ", "region-population", {
    kind: "population", title: "Tanzanian Regions by Population",
    desc: "Population of each region at the 2022 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("TZ", {
    page: "Regions of Tanzania", find: ["Rank (Area)", "Region", "Capital", "Districts", "Population (2022)"], name: 1, value: num(5), scale: 1e-6, detail: 2,
    tidy: (n) => n.replace(/ Region$/, ""),
    year: 2022, by: "National Bureau of Statistics (NBS), 2022 census", min: 25,
  })),
];
export default rankings;

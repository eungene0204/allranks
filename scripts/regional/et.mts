import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Ethiopia — regions, cities.

const rankings: Pipeline[] = [
  rank("ET", "region-population", {
    kind: "population", title: "Ethiopian Regions by Population",
    desc: "Population of each region.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("ET", {
    page: "Regions of Ethiopia", find: ["Flag", "Name", "Population (2024)", "Area"], name: 1, value: num(2), scale: 1e-6, tidy: (n) => n.replace(/ \\(city\\)$| Region$/, ""),
    year: 2024, by: "Ethiopian Statistics Service (projection for 2024)", min: 5,
  })),
  rank("ET", "cities", {
    kind: "cities", title: "Largest Cities in Ethiopia",
    desc: "Ethiopian cities and towns ranked by population (2016 estimate).",
    unit: "people",
  }, fromTable("ET", {
    page: "List of cities and towns in Ethiopia", find: ["Order", "Name", "Census 2007", "Census 2016"], name: 1, value: num(5), detail: 6,
    year: 2016, by: "Central Statistical Agency of Ethiopia (2016 estimate)", limit: 60, min: 20,
  })),
];
export default rankings;

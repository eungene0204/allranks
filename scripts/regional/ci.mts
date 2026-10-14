import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Côte d'Ivoire — cities.

const rankings: Pipeline[] = [
  rank("CI", "cities", {
    kind: "cities", title: "Largest Cities in Côte d'Ivoire",
    desc: "Ivorian cities ranked by estimated population (2014 census).",
    unit: "people",
  }, fromTable("CI", {
    page: "List of cities in Ivory Coast", find: ["2005 rank", "Coordinates", "City / town", "Population", "Region"], name: 2, value: num(6), detail: 7, header: 2,
    year: 2014, by: "National Institute of Statistics (INS), 2014 census", limit: 40, min: 20,
  })),
];
export default rankings;

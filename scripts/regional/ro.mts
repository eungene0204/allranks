import { fromTable, heightLead, num, rank } from "./lib.mts";
import { parseNum } from "../lib/wikipedia.mts";
import type { Pipeline } from "../lib/types.mts";

// Romania — cities, counties, skyscrapers.

const rankings: Pipeline[] = [
  rank("RO", "cities", {
    kind: "cities", title: "Largest Cities in Romania",
    desc: "Romanian cities and towns ranked by population at the 2021 census.",
    unit: "people",
  }, fromTable("RO", {
    page: "List of cities and towns in Romania", find: ["City", "County", "Population (2021)", "Elevation (m)"], name: 0, value: num(2), detail: 1,
    year: 2021, by: "National Institute of Statistics (INS), 2021 census", limit: 100, min: 50,
  })),
  rank("RO", "county-population", {
    kind: "population", title: "Romanian Counties by Population",
    desc: "Population of each county (județ) at the 2021 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("RO", {
    page: "Counties of Romania", find: ["County", "County seat", "Name origin", "NUTS code"], name: 1, value: (r) => parseNum(r[r.length - 4]), scale: 1e-6,
    year: 2021, by: "National Institute of Statistics (INS), 2021 census", min: 30,
  })),
  rank("RO", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Romania",
    desc: "The tallest completed buildings in Romania, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("RO", {
    page: "List of tallest buildings in Romania", find: ["Name", "Image", "Height m (ft)", "Floors", "Year", "Location"], name: 0, value: heightLead, detail: 5,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 30, min: 5,
  })),
];
export default rankings;

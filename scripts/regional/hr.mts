import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Croatia — cities, counties, skyscrapers.

const rankings: Pipeline[] = [
  rank("HR", "cities", {
    kind: "cities", title: "Largest Cities in Croatia",
    desc: "Croatian cities and towns ranked by population of the municipality at the 2021 census.",
    unit: "people",
  }, fromTable("HR", {
    page: "List of cities and towns in Croatia", find: ["City / town", "County", "Municipal", "Town/City proper"], name: 0, value: num(2), detail: 1, header: 2,
    tidy: (n) => n.replace(/¤/g, "").trim(),
    year: 2021, by: "Croatian Bureau of Statistics (DZS), 2021 census", limit: 100, min: 50,
  })),
  rank("HR", "county-population", {
    kind: "population", title: "Croatian Counties by Population",
    desc: "Population of each county (županija) at the 2021 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("HR", {
    page: "Counties of Croatia", find: ["County", "Seat", "Regions", "Statistical Regions"], name: 0, value: num(5), scale: 1e-6, detail: 2,
    year: 2021, by: "Croatian Bureau of Statistics (DZS), 2021 census", min: 15,
  })),
  rank("HR", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Croatia",
    desc: "The tallest completed buildings in Croatia, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("HR", {
    page: "List of tallest buildings in Croatia", find: ["Rank", "Name", "Location", "Height meters / feet", "Floors"], name: 1, value: heightLead, detail: 2, drop: /TV Tower/,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 30, min: 5,
  })),
];
export default rankings;

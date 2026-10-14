import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// United Arab Emirates — emirates, cities, skyscrapers.

const rankings: Pipeline[] = [
  rank("AE", "emirate-population", {
    kind: "population", title: "Emirates of the UAE by Population",
    desc: "Population of each emirate.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("AE", {
    page: "Emirates of the United Arab Emirates", find: ["Map", "Flag", "Emirate", "Arabic name"], name: 2, value: num(6), scale: 1e-6, 
    year: 2024, by: "Federal Competitiveness and Statistics Centre and emirate statistics offices", min: 5,
  })),
  rank("AE", "cities", {
    kind: "cities", title: "Largest Cities in the UAE",
    desc: "Emirati cities ranked by population.",
    unit: "people",
  }, fromTable("AE", {
    page: "List of cities in the United Arab Emirates", find: ["Nº", "City", "Population", "Emirate", "Location"], name: 1, value: num(2), detail: 3,
    year: 2020, by: "Emirate statistics centres (latest published)", limit: 27, min: 10,
  })),
  rank("AE", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in the UAE",
    desc: "The tallest completed buildings in the UAE, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("AE", {
    page: "List of tallest buildings in the United Arab Emirates", find: ["Rank", "Name", "Height m (ft)", "Floors", "Year", "City"], name: 1, value: heightLead, detail: 5,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50, min: 5,
  })),
];
export default rankings;

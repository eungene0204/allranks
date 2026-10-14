import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Morocco — cities, regions, skyscrapers.

const rankings: Pipeline[] = [
  rank("MA", "cities", {
    kind: "cities", title: "Largest Cities in Morocco",
    desc: "Moroccan cities ranked by population at the 2024 census.",
    unit: "people",
  }, fromTable("MA", {
    page: "List of cities in Morocco", find: ["City", "Population (2024)", "Region"], name: 0, value: num(1), detail: 2,
    year: 2024, by: "High Commission for Planning (HCP), 2024 census", limit: 60, min: 30,
  })),
  rank("MA", "region-population", {
    kind: "population", title: "Moroccan Regions by Population",
    desc: "Population of each region at the 2024 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("MA", {
    page: "Regions of Morocco", find: ["Map number", "Region", "Capital", "Population (2014)", "Population (2024)"], name: 1, value: num(4), scale: 1e-6, detail: 2,
    year: 2024, by: "High Commission for Planning (HCP), 2024 census", min: 10,
  })),
  rank("MA", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Morocco",
    desc: "The tallest buildings in Morocco, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("MA", {
    page: "List of tallest buildings in Morocco", find: ["Rank", "Name", "Image", "Location", "Height m (ft)", "Floors", "Year"], name: 1, value: heightLead, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 20, min: 5,
  })),
];
export default rankings;

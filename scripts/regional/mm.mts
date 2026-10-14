import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Myanmar — states and regions, towns, skyscrapers.

const rankings: Pipeline[] = [
  rank("MM", "state-population", {
    kind: "population", title: "Myanmar States and Regions by Population",
    desc: "Population of each state and region (2024 estimate).",
    unit: "million people", suffix: "M", decimals: 1,
  }, fromTable("MM", {
    page: "Administrative divisions of Myanmar", find: ["Flag", "Name", "Burmese", "Capital", "ISO", "Pop. (2024)"], name: 1, value: num(6), scale: 1e-6, detail: 5,
    tidy: (n) => n.replace(/ (Region|State)$/, ""),
    year: 2024, by: "Ministry of Immigration and Population (2024)", min: 5,
  })),
  rank("MM", "cities", {
    kind: "cities", title: "Largest Towns in Myanmar",
    desc: "Burmese towns ranked by population at the 2014 census.",
    unit: "people",
  }, fromTable("MM", {
    page: "List of cities and largest towns in Myanmar", find: ["Rank", "Town", "State/Region", "2014 Census"], name: 1, value: num(3), detail: 2,
    year: 2014, by: "Department of Population, 2014 census", limit: 50, min: 30,
  })),
  rank("MM", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Myanmar",
    desc: "The tallest completed buildings in Myanmar, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("MM", {
    page: "List of tallest buildings in Myanmar", find: ["Rank", "Name", "Image", "Location", "Height: m (ft)"], name: 1, value: heightLead, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 30, min: 5,
  })),
];
export default rankings;

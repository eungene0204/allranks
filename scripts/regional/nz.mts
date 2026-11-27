import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// New Zealand — regions, urban areas, skyscrapers.

const rankings: Pipeline[] = [
  rank("NZ", "cities", {
    kind: "cities", title: "Largest Urban Areas in New Zealand",
    desc: "Major and large urban areas ranked by estimated population.",
    unit: "people",
  }, fromTable("NZ", {
    page: "List of cities in New Zealand", find: ["Rank", "Urban area", "Population", "Population density"], name: 1, value: num(2),
    year: 2024, by: "Stats NZ, subnational population estimates", limit: 30,
  })),
  rank("NZ", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in New Zealand",
    desc: "The tallest completed structures in New Zealand, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("NZ", {
    page: "List of tallest buildings in New Zealand", find: ["Rank", "Name", "Image", "City", "Height", "Floors", "Year"], name: 1, value: heightLead, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

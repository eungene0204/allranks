import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Israel — cities, skyscrapers.

const rankings: Pipeline[] = [
  rank("IL", "cities", {
    kind: "cities", title: "Largest Cities in Israel",
    desc: "Israeli cities ranked by estimated population (2024).",
    unit: "people",
  }, fromTable("IL", {
    page: "List of cities in Israel", find: ["Name", "Photo", "District", "Metro area", "Founded"], name: 0, value: num(6), detail: 2, header: 2,
    year: 2024, by: "Israel Central Bureau of Statistics (2024)", limit: 80, min: 30,
  })),
  rank("IL", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Israel",
    desc: "The tallest completed buildings in Israel, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("IL", {
    page: "List of tallest buildings in Israel", find: ["Rank", "Name", "Image", "City", "Location", "Year", "Use", "Height m (ft)"], name: 1, value: heightLead, detail: 3, 
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Kazakhstan — cities, skyscrapers.

const rankings: Pipeline[] = [
  rank("KZ", "cities", {
    kind: "cities", title: "Largest Cities in Kazakhstan",
    desc: "Kazakh cities ranked by population (2023).",
    unit: "people",
  }, fromTable("KZ", {
    page: "List of cities in Kazakhstan", find: ["Insignia", "Name in English", "Name in Kazakh", "Pop. 2023"], name: 1, value: num(9), detail: 11,
    year: 2023, by: "Bureau of National Statistics of Kazakhstan (2023)", limit: 40, min: 10,
  })),
  rank("KZ", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Kazakhstan",
    desc: "The tallest completed buildings in Kazakhstan, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("KZ", {
    page: "List of tallest buildings in Kazakhstan", find: ["Rank", "Name", "Image", "City", "Height m (ft)", "Floors", "Year"], name: 1, value: heightLead, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50, min: 5,
  })),
];
export default rankings;

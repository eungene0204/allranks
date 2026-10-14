import { fromTable, heightLead, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Netherlands — skyscrapers, airports.

const rankings: Pipeline[] = [
  rank("NL", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in the Netherlands",
    desc: "The tallest completed buildings in the Netherlands, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("NL", {
    page: "List of tallest buildings in the Netherlands", find: ["Name", "Height", "Year", "Floors", "City"], name: 1, value: heightLead, detail: 5,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

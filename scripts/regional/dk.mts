import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Denmark — skyscrapers, airports.

const rankings: Pipeline[] = [
  rank("DK", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Denmark",
    desc: "The tallest completed buildings in Denmark, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("DK", {
    page: "List of tallest buildings in Denmark", find: ["Rank", "Name", "Image", "Year", "Height", "Location"], name: 1, value: heightLead, detail: 5, 
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("DK", "airports", {
    kind: "airports", title: "Busiest Airports in Denmark",
    desc: "Danish airports ranked by total passengers in 2025.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("DK", {
    page: "List of the busiest airports in Denmark", find: ["Rank", "Country", "Airport", "Change 2024–2025"], name: 2, value: num(5), detail: 3, scale: 1e-6,
    keep: (r) => r[1] === "Denmark", year: 2025, by: "Danish Transport Authority and airport operators (2025)", min: 5,
  })),
];
export default rankings;

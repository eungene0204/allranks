import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Ireland — counties, skyscrapers, airports.

const rankings: Pipeline[] = [
  rank("IE", "county-population", {
    kind: "population", title: "Irish Counties by Population",
    desc: "Population of the counties of Ireland at the latest census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("IE", {
    page: "List of Irish counties by population", find: ["Rank", "County", "Population", "Traditional province"], name: 1, value: num(2), scale: 1e-6, header: 2,
    drop: /^(Island of Ireland|Republic of Ireland|Northern Ireland|Dublin City|Fingal|South Dublin|Dún Laoghaire.*)$/, keep: (r) => r[6] !== "Northern Ireland", year: 2022, by: "Central Statistics Office Ireland, Census 2022", min: 20,
  })),
  rank("IE", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Ireland",
    desc: "The tallest completed buildings in the Republic of Ireland, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("IE", {
    page: "List of tallest buildings in Ireland", find: ["Rank", "Name", "Location", "Type", "Year completed"], skip: 1, name: 1, value: heightLead, detail: 2,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 30, min: 5,
  })),
  rank("IE", "airports", {
    kind: "airports", title: "Busiest Airports in Ireland",
    desc: "Irish airports ranked by total passengers in 2025.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("IE", {
    page: "List of the busiest airports in Ireland", find: ["Rank 2025", "Airport", "Total passengers 2025"], name: 1, value: num(5), detail: 2, scale: 1e-6,
    year: 2025, by: "Irish airport operators (2025)", min: 5,
  })),
];
export default rankings;

import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Austria — states, cities, skyscrapers.

const rankings: Pipeline[] = [
  rank("AT", "state-gdp", {
    kind: "gdp", title: "Austrian States by GDP",
    desc: "Gross domestic product of the nine states in 2024, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 1,
  }, fromTable("AT", {
    page: "List of Austrian states by GDP", find: ["Rank", "State", "Gross domestic product", "real growth rate"], name: 1, value: num(2), scale: 1e-3, drop: /^Austria$/,
    year: 2024, by: "Statistics Austria (2024)", min: 8,
  })),
  rank("AT", "state-gdp-per-capita", {
    kind: "gdp-pc", title: "Austrian States by GDP per Capita",
    desc: "Gross domestic product per resident in 2024, in euros.",
    unit: "EUR per person", prefix: "€",
  }, fromTable("AT", {
    page: "List of Austrian states by GDP", find: ["Rank", "State", "GDP per capita"], name: 1, value: num(2), drop: /^Austria$/,
    year: 2024, by: "Statistics Austria (2024)", min: 8,
  })),
  rank("AT", "cities", {
    kind: "cities", title: "Largest Cities in Austria",
    desc: "The 20 most populous Austrian cities (2025).",
    unit: "people",
  }, fromTable("AT", {
    page: "List of cities and towns in Austria", find: ["Name", "Federal state", "Population (2025)"], name: 0, value: num(2), detail: 1,
    year: 2025, by: "Statistics Austria (2025)", min: 10,
  })),
  rank("AT", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Austria",
    desc: "The tallest completed buildings in Austria, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("AT", {
    page: "List of tallest buildings in Austria", find: ["Rank", "Name", "Image", "City", "Height m (ft)", "Floors"], name: 1, value: heightLead, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

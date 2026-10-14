import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Sweden — counties, urban areas, skyscrapers.

const rankings: Pipeline[] = [
  rank("SE", "county-gdp", {
    kind: "gdp", title: "Swedish Counties by GDP",
    desc: "Gross domestic product of each county, in billions of Swedish kronor.",
    unit: "SEK billion", suffix: " bn SEK", decimals: 0,
  }, fromTable("SE", {
    page: "List of Swedish counties by GDP", find: ["Rank", "County", "GDP (mil. SEK)"], name: 1, value: num(2), scale: 1e-3, drop: /^Sweden$/,
    year: 2022, by: "Statistics Sweden (SCB), regional accounts", min: 18,
  })),
  rank("SE", "county-gdp-per-capita", {
    kind: "gdp-pc", title: "Swedish Counties by GDP per Capita",
    desc: "Gross domestic product per resident of each county, in Swedish kronor.",
    unit: "SEK per person", suffix: " SEK",
  }, fromTable("SE", {
    page: "List of Swedish counties by GDP", find: ["Rank", "County", "GDP per capita in SEK"], name: 1, value: num(2), drop: /^Sweden$/,
    year: 2022, by: "Statistics Sweden (SCB), regional accounts", min: 18,
  })),
  rank("SE", "cities", {
    kind: "cities", title: "Largest Urban Areas in Sweden",
    desc: "The 100 largest Swedish urban areas (tätorter) by population in 2023.",
    unit: "people",
  }, fromTable("SE", {
    page: "List of urban areas in Sweden by population", find: ["Urban area (locality)", "Population (2023)", "Land area"], name: 0, value: num(1),
    year: 2023, by: "Statistics Sweden (SCB), urban areas 2023", limit: 100,
  })),
  rank("SE", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Sweden",
    desc: "The tallest completed buildings in Sweden, by architectural height.",
    unit: "metres", suffix: " m",
  }, fromTable("SE", {
    page: "List of tallest buildings in Sweden", find: ["Name", "Picture", "Location", "Height to architectural", "Floors"], name: 0, value: heightLead, detail: 2,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

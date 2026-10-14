import { heightPair, fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Spain — autonomous communities, municipalities, skyscrapers, airports.

const tidy = (n: string) => n.replace(/^Community of Madrid$/, "Madrid");

const rankings: Pipeline[] = [
  rank("ES", "community-population", {
    kind: "population", title: "Spanish Regions by Population",
    desc: "Population of the autonomous communities and cities in 2024.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("ES", {
    page: "Ranked lists of Spanish autonomous communities", find: ["Autonomous community/city", "Population (2024)"], name: 0, value: num(1), scale: 1e-6,
    drop: /^(Spain|Total)/, tidy, year: 2024, by: "Instituto Nacional de Estadística (INE), 2024", min: 15,
  })),
  rank("ES", "community-gdp", {
    kind: "gdp", title: "Spanish Regions by GDP",
    desc: "Gross domestic product of each autonomous community in 2023, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 1,
  }, fromTable("ES", {
    page: "Ranked lists of Spanish autonomous communities", find: ["Autonomous community", "GDP in billions", "Percentage of GDP"], name: 0, value: num(1),
    drop: /^(Spain|Total)/, tidy, year: 2023, by: "Instituto Nacional de Estadística (INE), 2023", min: 15,
  })),
  rank("ES", "cities", {
    kind: "cities", title: "Largest Cities in Spain",
    desc: "The 100 most populous Spanish municipalities.",
    unit: "people",
  }, fromTable("ES", {
    page: "List of cities in Spain by population", find: ["Municipality", "Province", "Population"], name: 0, value: num(2), detail: 1,
    year: 2024, by: "Instituto Nacional de Estadística (INE)", limit: 100,
  })),
  rank("ES", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Spain",
    desc: "The tallest completed buildings in Spain, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("ES", {
    page: "List of tallest buildings in Spain", find: ["Rank", "Name", "City", "Height (m)", "Floors"], name: 1, value: heightPair, detail: 2,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("ES", "airports", {
    kind: "airports", title: "Busiest Airports in Spain",
    desc: "Spanish airports ranked by total passengers in 2025.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("ES", {
    page: "List of the busiest airports in Spain", find: ["Rank", "Airport", "IATA", "Total passengers"], name: 1, value: num(4), detail: 3, scale: 1e-6, drop: /^For all/,
    year: 2025, by: "Aena, airport statistics (2025)", limit: 40,
  })),
];
export default rankings;

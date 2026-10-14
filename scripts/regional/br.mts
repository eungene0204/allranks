import { firstMetres, fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Brazil — federative units, municipalities, skyscrapers, airports.

const GDP = { page: "List of Brazilian federative units by gross regional domestic product", find: ["Federative unit", "GDP in BRL billion"] } as const;

const rankings: Pipeline[] = [
  rank("BR", "state-population", {
    kind: "population", title: "Brazilian States by Population",
    desc: "Estimated population of the 26 states and the Federal District (2026).",
    unit: "million people", suffix: "M", decimals: 1,
  }, fromTable("BR", {
    page: "Federative units of Brazil", find: ["Flag and name", "Code", "Capital", "Population (2026)"], name: 0, value: num(5), scale: 1e-6, header: 2, drop: /^Brazil$/,
    year: 2026, by: "IBGE, population estimates (2026)", min: 20,
  })),
  rank("BR", "state-gdp", {
    kind: "gdp", title: "Brazilian States by GDP",
    desc: "Gross regional domestic product of each state in 2023, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("BR", { ...GDP, name: 0, value: num(4), drop: /Region$|^Brazil$/, year: 2023, by: "IBGE, regional accounts (2023)", min: 20 })),
  rank("BR", "state-gdp-per-capita", {
    kind: "gdp-pc", title: "Brazilian States by GDP per Capita",
    desc: "Economic output per resident in 2023, in US dollars.",
    unit: "USD per person", prefix: "$",
  }, fromTable("BR", { ...GDP, name: 0, value: num(7), scale: 1000, drop: /Region$|^Brazil$/, year: 2023, by: "IBGE, regional accounts (2023)", min: 20 })),
  rank("BR", "cities", {
    kind: "cities", title: "Largest Cities in Brazil",
    desc: "The 100 most populous Brazilian municipalities (2025 estimate).",
    unit: "people",
  }, fromTable("BR", {
    page: "List of municipalities in Brazil by population", find: ["Municipality", "State", "2025 estimate", "2022 census"], name: 0, value: num(2), detail: 1,
    year: 2025, by: "IBGE, population estimates (2025)", limit: 100,
  })),
  rank("BR", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Brazil",
    desc: "The tallest completed buildings in Brazil, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("BR", {
    page: "List of tallest buildings in Brazil", find: ["Rank", "Name", "Municipality", "State", "Height (m)", "Architecture"], name: 1, value: firstMetres, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("BR", "airports", {
    kind: "airports", title: "Busiest Airports in Brazil",
    desc: "Brazilian airports ranked by total passengers in 2022.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("BR", {
    page: "List of the busiest airports in Brazil", find: ["Rank", "Airport", "Location", "Total passengers", "Rank change"], name: 1, value: num(3), detail: 2, scale: 1e-6,
    year: 2022, by: "ANAC / Infraero (2022)", limit: 40,
  })),
];
export default rankings;

import { afterYear, bigNum, fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Mexico — states, cities, skyscrapers, airports.

const GDP = { page: "List of Mexican states by GDP", find: ["Federal entities by GDP 2024", "Nominal GDP (USD)"] } as const;

const rankings: Pipeline[] = [
  rank("MX", "state-population", {
    kind: "population", title: "Mexican States by Population",
    desc: "Estimated population of the 31 states and Mexico City (2024).",
    unit: "million people", suffix: "M", decimals: 1,
  }, fromTable("MX", {
    page: "List of states of Mexico", find: ["Coat of arms and name", "Cities", "Admission to federation"], name: 1, value: bigNum(2), scale: 1e-6, header: 2, keep: (r) => r[0] !== "Mexico total",
    tidy: (n) => n.replace(/\s*\(.*\)$/, "").replace(/^México$/, "State of Mexico").replace(/^(Veracruz|Michoacán|Coahuila) de .*$/, "$1"),
    year: 2024, by: "INEGI / CONAPO, population estimates (Q4 2024)", min: 30,
  })),
  rank("MX", "state-gdp", {
    kind: "gdp", title: "Mexican States by GDP",
    desc: "Nominal GDP of each state in 2024, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("MX", { ...GDP, name: 1, value: num(3), scale: 1e-3, header: 2, drop: /^[\d,]+$|^(Mexico|Total)$/, year: 2024, by: "INEGI, state GDP (2024)", min: 30 })),
  rank("MX", "cities", {
    kind: "cities", title: "Largest Cities in Mexico",
    desc: "The 100 most populous Mexican cities at the 2020 census.",
    unit: "people",
  }, fromTable("MX", {
    page: "List of cities in Mexico", find: ["Rank", "City", "Municipality", "2020 Census"], name: 1, value: num(5), detail: 3,
    year: 2020, by: "INEGI, 2020 census", limit: 100,
  })),
  rank("MX", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Mexico",
    desc: "The tallest completed buildings in Mexico, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("MX", {
    page: "List of tallest buildings in Mexico", find: ["Rank", "Name", "Image", "Height m (ft)", "Floors", "City"], name: 1, value: heightLead, detail: afterYear,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("MX", "airports", {
    kind: "airports", title: "Busiest Airports in Mexico",
    desc: "Mexican airports ranked by passengers in 2025.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("MX", {
    page: "List of the busiest airports in Mexico", find: ["#", "Airport", "IATA", "ICAO", "% (24/25)"], name: 1, value: num(9), scale: 1e-6,
    year: 2025, by: "Mexican airport groups (ASUR, GAP, OMA, AICM), 2025", limit: 40,
  })),
];
export default rankings;

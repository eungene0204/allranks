import { parseNum } from "../lib/wikipedia.mts";
import { afterYear, fromTable, nameCell, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Malaysia — states, skyscrapers, airports.

const rankings: Pipeline[] = [
  rank("MY", "state-gdp", {
    kind: "gdp", title: "Malaysian States by GDP",
    desc: "Nominal GDP of each state and federal territory in 2025, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("MY", {
    page: "List of states and federal territories of Malaysia by GDP", find: ["State or federal territory", "GDP Nominal / PPP"], name: nameCell, value: (r) => parseNum(r.find((c) => c.includes(" / "))), scale: 1e-3, header: 2,
    drop: /^Malaysia$/, year: 2025, by: "Department of Statistics Malaysia (DOSM), 2025", min: 12,
  })),
  rank("MY", "state-gdp-per-capita", {
    kind: "gdp-pc", title: "Malaysian States by GDP per Capita",
    desc: "Nominal GDP per resident in 2025, in US dollars.",
    unit: "USD per person", prefix: "$",
  }, fromTable("MY", {
    page: "List of states and federal territories of Malaysia by GDP", find: ["State or federal territory", "GDP per capita Nominal"], name: nameCell, value: (r) => parseNum(r.find((c) => c.includes(" / "))), header: 2,
    drop: /^Malaysia$/, year: 2025, by: "Department of Statistics Malaysia (DOSM), 2025", min: 12,
  })),
  rank("MY", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Malaysia",
    desc: "The tallest completed buildings in Malaysia, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("MY", {
    page: "List of tallest buildings in Malaysia", find: ["Name of skyscraper", "Height", "Flr.", "Location"], name: 0, value: num(1), detail: afterYear, header: 2,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("MY", "airports", {
    kind: "airports", title: "Busiest Airports in Malaysia",
    desc: "Malaysian airports ranked by passengers in 2024.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("MY", {
    page: "List of the busiest airports in Malaysia", find: ["Airport name", "State", "City served", "IATA", "2024"], name: 0, value: num(-1), detail: 1, scale: 1e-6,
    year: 2024, by: "Malaysia Airports Holdings Berhad (2024)", limit: 30,
  })),
];
export default rankings;

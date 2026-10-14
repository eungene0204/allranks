import { fromTable, heightOf, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// India — states and union territories, cities, skyscrapers, airports, companies.

const tidyState = (n: string) => n.replace(/\s*\*+$/, "").replace(/^Andaman and Nicobar Island$/, "Andaman and Nicobar Islands");

const rankings: Pipeline[] = [
  rank("IN", "state-population", {
    kind: "population", title: "Indian States by Population",
    desc: "Estimated population of each state and union territory.",
    unit: "million people", suffix: "M", decimals: 1,
  }, fromTable("IN", {
    page: "List of states and union territories of India by population", find: ["State or Union Territory", "Population (2024)"],
    name: 1, value: num(2), scale: 1e-6, header: 2, tidy: tidyState, drop: /^India$/, year: 2024, by: "Census of India projections (2024)", min: 25,
  })),
  rank("IN", "state-gdp", {
    kind: "gdp", title: "Indian States by GDP",
    desc: "Gross state domestic product at current prices in fiscal 2023–24, in billions of Indian rupees.",
    unit: "₹ billion", prefix: "₹", suffix: "B", decimals: 0,
  }, fromTable("IN", {
    page: "List of Indian states and union territories by GDP", find: ["GSDP at current prices", "2024-25", "Change"],
    name: 1, value: num(2), tidy: tidyState, year: 2024, by: "Ministry of Statistics and Programme Implementation (FY2023–24)", min: 25,
  })),
  rank("IN", "cities", {
    kind: "cities", title: "Largest Cities in India",
    desc: "The 100 most populous Indian cities at the 2011 census.",
    unit: "people",
  }, fromTable("IN", {
    page: "List of cities in India by population", find: ["Name", "State or Union territory", "2011 Census"], name: 0, value: num(2), detail: 1, header: 2,
    drop: /^India$/, year: 2011, by: "Census of India 2011", limit: 100, min: 50,
  })),
  rank("IN", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in India",
    desc: "The tallest completed buildings in India, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("IN", {
    page: "List of tallest buildings in India", find: ["Rank", "Name", "City", "Height", "Floors"], name: 1, value: (r) => heightOf(r.slice(3)), detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("IN", "airports", {
    kind: "airports", title: "Busiest Airports in India",
    desc: "Airports ranked by passengers in fiscal year 2025–26.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("IN", {
    page: "List of the busiest airports in India", find: ["Passenger traffic for FY 2025–26", "Rank", "Name"], name: 1, value: num(5), detail: 2, scale: 1e-6,
    year: 2026, by: "Airports Authority of India (FY2025–26)", limit: 50,
  })),
  rank("IN", "companies", {
    kind: "companies", title: "Largest Companies in India",
    desc: "The biggest Indian companies by revenue (Forbes Global 2000).",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("IN", {
    page: "List of largest companies in India", find: ["Forbes 2000 rank", "Revenue (billions US$)"], name: 2, value: num(4), detail: 8,
    year: 2025, by: "Forbes Global 2000", limit: 50,
  })),
];

export default rankings;

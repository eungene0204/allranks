import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Canada — provinces and territories, skyscrapers, airports, universities.

const rankings: Pipeline[] = [
  rank("CA", "universities", {
    kind: "universities", title: "Top Universities in Canada",
    desc: "Canadian universities by their position in the 2026 QS World University Rankings (lower is better).",
    unit: "world rank", order: "asc",
  }, fromTable("CA", {
    page: "Rankings of universities in Canada", find: ["University", "2026 QS World University R", "Times Higher"], name: 0, value: num(1), asc: true,
    year: 2026, by: "QS World University Rankings 2026", note: "Rank among all universities worldwide.", min: 10,
  })),
  rank("CA", "province-population", {
    kind: "population", title: "Canadian Provinces by Population",
    desc: "Population of the provinces and territories at the 2021 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("CA", {
    page: "Population of Canada by province and territory", find: ["Rank", "Name", "2021 census", "2016 census"], name: 1, value: num(2), scale: 1e-6, drop: /^Canada$/,
    year: 2021, by: "Statistics Canada, 2021 census", min: 10,
  })),
  rank("CA", "province-gdp", {
    kind: "gdp", title: "Canadian Provinces by GDP",
    desc: "Nominal GDP of each province and territory in 2024, in billions of Canadian dollars.",
    unit: "CAD billion", prefix: "C$", suffix: "B", decimals: 0,
  }, fromTable("CA", {
    page: "List of Canadian provinces and territories by gross domestic product", find: ["Province or territory", "GDP (million CAD, 2024)"], name: 0, value: num(1), scale: 1e-3,
    drop: /^Canada$/, year: 2024, by: "Statistics Canada, 2024", min: 10,
  })),
  rank("CA", "province-gdp-per-capita", {
    kind: "gdp-pc", title: "Canadian Provinces by GDP per Capita",
    desc: "Nominal GDP per resident in 2024, in Canadian dollars.",
    unit: "CAD per person", prefix: "C$",
  }, fromTable("CA", {
    page: "List of Canadian provinces and territories by gross domestic product", find: ["Province or territory", "GDP (million CAD, 2024)"], name: 0, value: num(4),
    drop: /^Canada$/, year: 2024, by: "Statistics Canada, 2024", min: 10,
  })),
  rank("CA", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Canada",
    desc: "The tallest completed buildings and towers in Canada, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("CA", {
    page: "List of tallest buildings in Canada", find: ["Rank", "Name", "Image", "City", "Height m (ft)", "Floors", "Purpose"], name: 1, value: num(4), detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("CA", "airports", {
    kind: "airports", title: "Busiest Airports in Canada",
    desc: "Canadian airports ranked by total passengers in 2025.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("CA", {
    page: "List of the busiest airports in Canada", find: ["Rank", "Rank change", "Airport", "Serves", "Province"], name: 2, value: num(5), detail: 4, scale: 1e-6,
    year: 2025, by: "Transport Canada / airport authorities (2025)", limit: 40,
  })),
];
export default rankings;

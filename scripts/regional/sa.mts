import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Saudi Arabia — provinces, cities, skyscrapers.

const rankings: Pipeline[] = [
  rank("SA", "province-population", {
    kind: "population", title: "Saudi Provinces by Population",
    desc: "Population of the 13 provinces at the 2022 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("SA", {
    page: "Provinces of Saudi Arabia", find: ["#", "Province", "Historical region", "Population (2022 census)"], name: 1, value: num(6), scale: 1e-6, drop: /^(Saudi Arabia|\d+)$/,
    tidy: (n) => n.replace(/ Province$/, ""), year: 2022, by: "General Authority for Statistics (GASTAT), 2022 census", min: 10,
  })),
  rank("SA", "cities", {
    kind: "cities", title: "Largest Cities in Saudi Arabia",
    desc: "Saudi cities ranked by population at the 2022 census.",
    unit: "people",
  }, fromTable("SA", {
    page: "List of cities and towns in Saudi Arabia", find: ["Rank", "City", "Province", "Population (2022)"], name: 1, value: num(3), detail: (r) => r[2].replace(/ Province$/, ""),
    year: 2022, by: "General Authority for Statistics (GASTAT), 2022 census", limit: 100,
  })),
  rank("SA", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Saudi Arabia",
    desc: "The tallest completed buildings in Saudi Arabia, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("SA", {
    page: "List of tallest buildings in Saudi Arabia", find: ["Rank", "Name", "Image", "City", "Height m (ft)", "Floors", "Coordinates"], name: 1, value: heightLead, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

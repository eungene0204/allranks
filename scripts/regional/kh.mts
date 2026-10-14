import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Cambodia — provinces, cities, skyscrapers.

const rankings: Pipeline[] = [
  rank("KH", "province-population", {
    kind: "population", title: "Cambodian Provinces by Population",
    desc: "Population of each province and the capital at the 2024 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("KH", {
    page: "Provinces of Cambodia", find: ["Name", "Khmer", "UNGEGN", "Capital (seat)", "Population (2024)"], name: 0, value: num(4), scale: 1e-6, detail: 3,
    year: 2024, by: "National Institute of Statistics, 2024 census", min: 20,
  })),
  rank("KH", "cities", {
    kind: "cities", title: "Largest Cities in Cambodia",
    desc: "Cambodian cities and towns ranked by population.",
    unit: "people",
  }, fromTable("KH", {
    page: "List of cities and towns in Cambodia", find: ["Name", "Province", "Population", "Image"], name: 0, value: num(2), detail: 1,
    year: 2019, by: "National Institute of Statistics, 2019 census", limit: 30, min: 15,
  })),
  rank("KH", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Cambodia",
    desc: "The tallest buildings in Cambodia, by height.",
    unit: "metres", suffix: " m", decimals: 1,
  }, fromTable("KH", {
    page: "List of tallest buildings in Cambodia", find: ["Rank", "Name", "Investors", "Height (m)", "Floors", "Year"], name: 1, value: num(3), detail: 2,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 30, min: 5,
  })),
];
export default rankings;

import { afterName, bigNum, firstMetres, fromTable, nameCell, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Indonesia — provinces, cities, skyscrapers.

const rankings: Pipeline[] = [
  rank("ID", "province-population", {
    kind: "population", title: "Indonesian Provinces by Population",
    desc: "Estimated population of the provinces in mid-2025.",
    unit: "million people", suffix: "M", decimals: 1,
  }, fromTable("ID", {
    page: "Provinces of Indonesia", find: ["Code", "Coat of arms", "Land Area", "Population (mid 2025)"], name: 3, value: bigNum(5), scale: 1e-6, header: 2,
    year: 2025, by: "Statistics Indonesia (BPS), mid-2025 estimates", min: 30,
  })),
  rank("ID", "province-gdp", {
    kind: "gdp", title: "Indonesian Provinces by GDP",
    desc: "Nominal GDP of each province in 2025, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("ID", {
    page: "List of Indonesian provinces by GDP", find: ["Rank", "Province", "Region", "GDP Nominal"], name: 1, value: num(4), keep: (r) => /^\d+$/.test(r[0]),
    year: 2025, by: "Statistics Indonesia (BPS), 2025", min: 30,
  })),
  rank("ID", "cities", {
    kind: "cities", title: "Largest Cities in Indonesia",
    desc: "The 100 most populous Indonesian cities at the 2020 census.",
    unit: "people",
  }, fromTable("ID", {
    page: "List of cities in Indonesia", find: ["City", "Province", "Region", "2020 census", "2010 census"], name: 0, value: num(3), detail: 1,
    year: 2020, by: "Statistics Indonesia (BPS), 2020 census", limit: 100,
  })),
  rank("ID", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Indonesia",
    desc: "The tallest completed buildings in Indonesia, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("ID", {
    page: "List of tallest buildings in Indonesia", find: ["Rank", "Building", "City", "Height (m)", "Floors", "Built"], name: nameCell, value: firstMetres, detail: afterName,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

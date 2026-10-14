import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Bulgaria — cities, provinces, skyscrapers.

const rankings: Pipeline[] = [
  rank("BG", "cities", {
    kind: "cities", title: "Largest Cities in Bulgaria",
    desc: "Bulgarian cities and towns ranked by population at the 2021 census.",
    unit: "people",
  }, fromTable("BG", {
    page: "List of cities and towns in Bulgaria", find: ["Rank", "City/Town", "Province (Oblast)", "Population 2024 official"], name: 2, value: num(8), detail: 3,
    year: 2021, by: "National Statistical Institute (NSI), 2021 census", limit: 100, min: 30,
  })),
  rank("BG", "province-population", {
    kind: "population", title: "Bulgarian Provinces by Population",
    desc: "Population of each province (oblast) at the 2021 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("BG", {
    page: "Provinces of Bulgaria", find: ["Province", "Population (Census 2011)", "Population (Census 2021)", "Planning Region"], name: 0, value: num(2), scale: 1e-6, detail: 7, drop: /^Bulgaria$/,
    year: 2021, by: "National Statistical Institute (NSI), 2021 census", min: 20,
  })),
  rank("BG", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Bulgaria",
    desc: "The tallest completed buildings in Bulgaria, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("BG", {
    page: "List of tallest buildings in Bulgaria", find: ["Rank", "Name", "Location", "Height m", "Floors", "Use"], name: 1, value: num(3), detail: 2,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 30, min: 5,
  })),
];
export default rankings;

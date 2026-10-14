import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Turkey — provinces, skyscrapers.

const tidy = (n: string) => n.replace(/^İstanbul$/, "Istanbul");

const rankings: Pipeline[] = [
  rank("TR", "province-population", {
    kind: "population", title: "Turkish Provinces by Population",
    desc: "Registered population of the 81 provinces (2023).",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("TR", {
    page: "Provinces of Turkey by population", find: ["No.", "Province", "Region", "Population", "Ranking change"], name: 1, value: num(3), detail: 2, scale: 1e-6,
    tidy, year: 2023, by: "Turkish Statistical Institute (TurkStat), 2023", min: 75,
  })),
  rank("TR", "province-gdp", {
    kind: "gdp", title: "Turkish Provinces by GDP",
    desc: "Gross domestic product of each province in 2021, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("TR", {
    page: "List of Turkish provinces by GDP", find: ["List of provinces in Turkey by GDP in 2021"], name: 1, value: num(3), scale: 1e-3, header: 2,
    tidy, drop: /^Turkey$/, year: 2021, by: "Turkish Statistical Institute (TurkStat), 2021", min: 75,
  })),
  rank("TR", "province-gdp-per-capita", {
    kind: "gdp-pc", title: "Turkish Provinces by GDP per Capita",
    desc: "Gross domestic product per resident of each province in 2024, in US dollars.",
    unit: "USD per person", prefix: "$",
  }, fromTable("TR", {
    page: "List of Turkish provinces by GDP", find: ["List of provinces in Turkey by GDP per capita in 2024"], name: 1, value: num(3), header: 2,
    tidy, drop: /^Turkey$/, year: 2024, by: "Turkish Statistical Institute (TurkStat), 2024", min: 75,
  })),
  rank("TR", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Turkey",
    desc: "The tallest completed buildings in Turkey, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("TR", {
    page: "List of tallest buildings in Turkey", find: ["Rank", "Name", "Image", "City", "Height m (ft)", "Floors"], name: 1, value: num(4), detail: 3,
    tidy: (n) => n, year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

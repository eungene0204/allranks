import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Slovakia — regions, cities.

const rankings: Pipeline[] = [
  rank("SK", "region-gdp", {
    kind: "gdp", title: "Slovak Regions by GDP",
    desc: "Gross domestic product of the eight regions in 2022, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 1,
  }, fromTable("SK", {
    page: "List of Slovak regions by GDP", find: ["Rank", "Region", "GDP in mil EUR"], name: 1, value: num(2), scale: 1e-3, drop: /^Slovakia$/,
    year: 2022, by: "OECD regional statistics (2022)", min: 8,
  })),
  rank("SK", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "Slovak Regions by GDP per Capita",
    desc: "Gross domestic product per resident in 2022, in euros.",
    unit: "EUR per person", prefix: "€",
  }, fromTable("SK", {
    page: "List of Slovak regions by GDP", find: ["Rank", "Region", "GDP per capita in EUR"], name: 1, value: num(2), drop: /^Slovakia$/,
    year: 2022, by: "OECD regional statistics (2022)", min: 8,
  })),
  rank("SK", "cities", {
    kind: "cities", title: "Largest Cities in Slovakia",
    desc: "The 100 most populous Slovak cities and towns (2019).",
    unit: "people",
  }, fromTable("SK", {
    page: "List of cities and towns in Slovakia", find: ["City or town", "District", "Region", "Population"], name: 1, value: num(4), detail: 3, header: 2,
    year: 2019, by: "Statistical Office of the Slovak Republic (2019)", limit: 100, min: 50,
  })),
];
export default rankings;

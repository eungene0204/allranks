import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Estonia — counties.

const rankings: Pipeline[] = [
  rank("EE", "county-population", {
    kind: "population", title: "Estonian Counties by Population",
    desc: "Population of the 15 counties.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("EE", {
    page: "Counties of Estonia", find: ["County", "Capital", "GDP (mil. €)", "GDP per capita"], name: 2, value: num(5), scale: 1e-6, tidy: (n) => n.replace(/ County$/, ""),
    year: 2023, by: "Statistics Estonia (2023)", min: 12,
  })),
  rank("EE", "county-gdp", {
    kind: "gdp", title: "Estonian Counties by GDP",
    desc: "Gross domestic product of each county, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 1,
  }, fromTable("EE", {
    page: "Counties of Estonia", find: ["County", "Capital", "GDP (mil. €)", "GDP per capita"], name: 2, value: num(7), scale: 1e-3, tidy: (n) => n.replace(/ County$/, ""),
    year: 2023, by: "Statistics Estonia (2023)", min: 12,
  })),
  rank("EE", "county-gdp-per-capita", {
    kind: "gdp-pc", title: "Estonian Counties by GDP per Capita",
    desc: "Gross domestic product per resident, in euros.",
    unit: "EUR per person", prefix: "€",
  }, fromTable("EE", {
    page: "Counties of Estonia", find: ["County", "Capital", "GDP (mil. €)", "GDP per capita"], name: 2, value: num(8), tidy: (n) => n.replace(/ County$/, ""),
    year: 2023, by: "Statistics Estonia (2023)", min: 12,
  })),
];
export default rankings;

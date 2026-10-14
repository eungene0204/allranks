import { combine, fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Lithuania — counties, cities.

const rankings: Pipeline[] = [
  rank("LT", "county-population", {
    kind: "population", title: "Lithuanian Counties by Population",
    desc: "Population of the ten counties (2023).",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("LT", {
    page: "Counties of Lithuania", find: ["County (media help)", "Capital", "GDP (nominal)"], name: 1, value: num(4), scale: 1e-6, drop: /^Lithuania/, tidy: (n) => n.replace(/ County.*$/, ""),
    year: 2023, by: "Statistics Lithuania (2023)", min: 8,
  })),
  rank("LT", "county-gdp", {
    kind: "gdp", title: "Lithuanian Counties by GDP",
    desc: "Nominal GDP of each county, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 1,
  }, fromTable("LT", {
    page: "Counties of Lithuania", find: ["County (media help)", "Capital", "GDP (nominal)"], name: 1, value: num(6), drop: /^Lithuania/, tidy: (n) => n.replace(/ County.*$/, ""),
    year: 2023, by: "Statistics Lithuania (2023)", min: 8,
  })),
  rank("LT", "county-gdp-per-capita", {
    kind: "gdp-pc", title: "Lithuanian Counties by GDP per Capita",
    desc: "Nominal GDP per resident, in euros.",
    unit: "EUR per person", prefix: "€",
  }, fromTable("LT", {
    page: "Counties of Lithuania", find: ["County (media help)", "Capital", "GDP (nominal)"], name: 1, value: num(7), drop: /^Lithuania/, tidy: (n) => n.replace(/ County.*$/, ""),
    year: 2023, by: "Statistics Lithuania (2023)", min: 8,
  })),
  rank("LT", "cities", {
    kind: "cities", title: "Largest Cities in Lithuania",
    desc: "Lithuanian cities ranked by population (2026).",
    unit: "people",
  }, combine(
    ...[0, 1].map((skip) =>
      fromTable("LT", {
        page: "List of cities in Lithuania", find: ["#", "CoA", "City", "Pronunciation", "Population"], skip, name: 2, value: num(4), header: 2,
        year: 2026, by: "Statistics Lithuania (2026)", min: 5,
      }),
    ),
  )),
];
export default rankings;

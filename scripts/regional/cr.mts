import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Costa Rica — provinces.

const rankings: Pipeline[] = [
  rank("CR", "province-population", {
    kind: "population", title: "Costa Rican Provinces by Population",
    desc: "Population of the seven provinces.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("CR", {
    page: "Provinces of Costa Rica", find: ["Flag", "Province", "Capital", "Population"], name: 1, value: num(5), scale: 1e-6,
    year: 2022, by: "INEC Costa Rica, 2022 census", min: 7,
  })),
  rank("CR", "province-gdp-per-capita", {
    kind: "gdp-pc", title: "Costa Rican Provinces by GDP per Capita",
    desc: "GDP per resident in 2023, in 2015 international dollars (PPP).",
    unit: "intl. USD per person (PPP)", prefix: "$",
  }, fromTable("CR", {
    page: "Provinces of Costa Rica", find: ["Flag", "Province", "Capital", "Population"], name: 1, value: num(8),
    year: 2023, by: "Subnational Human Development Database / Global Data Lab (2023)", min: 7,
  })),
];
export default rankings;

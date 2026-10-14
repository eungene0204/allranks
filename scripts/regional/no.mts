import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Norway — counties.

const C = { page: "List of Norwegian counties by GDP", drop: /^Norway/, year: 2021, by: "OECD regional statistics (2021)", min: 10 } as const;

const rankings: Pipeline[] = [
  rank("NO", "county-gdp", {
    kind: "gdp", title: "Norwegian Counties by GDP",
    desc: "Gross domestic product of each county in 2021, in billions of Norwegian kroner.",
    unit: "NOK billion", suffix: " bn NOK", decimals: 0,
  }, fromTable("NO", { ...C, find: ["Rank", "County", "GDP in mil. NOK"], name: 1, value: num(2), scale: 1e-3 })),
  rank("NO", "county-gdp-per-capita", {
    kind: "gdp-pc", title: "Norwegian Counties by GDP per Capita",
    desc: "Gross domestic product per resident in 2021, in Norwegian kroner.",
    unit: "NOK per person", suffix: " NOK",
  }, fromTable("NO", { ...C, find: ["Rank", "County", "GDP per capita in NOK"], name: 1, value: num(2) })),
];
export default rankings;

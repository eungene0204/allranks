import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Finland — regions.

const R = { page: "List of Finnish regions by GDP", drop: /^Finland$/, year: 2021, by: "OECD regional statistics (2021)", min: 15 } as const;

const rankings: Pipeline[] = [
  rank("FI", "region-gdp", {
    kind: "gdp", title: "Finnish Regions by GDP",
    desc: "Gross domestic product of each region in 2021, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 1,
  }, fromTable("FI", { ...R, find: ["Rank", "Region", "GDP in mil EUR"], name: 1, value: num(2), scale: 1e-3 })),
  rank("FI", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "Finnish Regions by GDP per Capita",
    desc: "Gross domestic product per resident in 2021, in euros.",
    unit: "EUR per person", prefix: "€",
  }, fromTable("FI", { ...R, find: ["Rank", "Region", "GDP per capita in EUR"], name: 1, value: num(2) })),
];
export default rankings;

import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Greece — regions, skyscrapers.

const R = { drop: /^(EU|Greece)/, page: "List of Greek subdivisions by GDP", find: ["Rank", "Region", "Total GDP (€ million)"], year: 2023, by: "ELSTAT, regional accounts (2023)", min: 10 } as const;

const rankings: Pipeline[] = [
  rank("GR", "region-gdp", {
    kind: "gdp", title: "Greek Regions by GDP",
    desc: "Gross domestic product of the 13 regions, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 1,
  }, fromTable("GR", { ...R, name: 1, value: num(2), scale: 1e-3 })),
  rank("GR", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "Greek Regions by GDP per Capita",
    desc: "Gross domestic product per resident, in euros.",
    unit: "EUR per person", prefix: "€",
  }, fromTable("GR", { ...R, name: 1, value: num(5) })),
];
export default rankings;

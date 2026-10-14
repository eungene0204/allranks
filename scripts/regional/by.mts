import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Belarus — regions, cities.

const rankings: Pipeline[] = [
  rank("BY", "region-population", {
    kind: "population", title: "Belarusian Regions by Population",
    desc: "Population of the six regions and Minsk (2024).",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("BY", {
    page: "Regions of Belarus", find: ["Flag", "Region", "Capital", "Population (2024)"], name: 2, value: (r) => Number(String(r.find((c) => /^\d{1,3}(,\d{3})+$/.test(c.trim()))).replace(/,/g, "")), scale: 1e-6, drop: /^Belarus$/,
    tidy: (n) => n.replace(/^City of /, ""), year: 2024, by: "Belstat (2024)", min: 6,
  })),
  rank("BY", "cities", {
    kind: "cities", title: "Largest Cities in Belarus",
    desc: "Belarusian cities and towns ranked by estimated population (2025).",
    unit: "people",
  }, fromTable("BY", {
    page: "List of cities and towns in Belarus", find: ["Rank", "Belarusian (BGN/PCGN)", "Russian (BGN/PCGN)", "Status"], name: 1, value: num(6),
    tidy: (n) => n.replace(/\s*\(.*\)$/, ""), header: 2, year: 2025, by: "Belstat (2025 estimate)", limit: 60, min: 20,
  })),
];
export default rankings;

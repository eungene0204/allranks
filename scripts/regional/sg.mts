import { fromTable, num, rank } from "./lib.mts";
import { parseNum } from "../lib/wikipedia.mts";
import type { Pipeline } from "../lib/types.mts";

// Singapore — planning areas, skyscrapers.

const rankings: Pipeline[] = [
  rank("SG", "planning-areas", {
    kind: "population", title: "Singapore Planning Areas by Population",
    desc: "Population of each of Singapore's planning areas.",
    unit: "people",
  }, fromTable("SG", {
    page: "Planning areas of Singapore", find: ["English • Malay", "Chinese", "Tamil", "Region", "Population"], name: 0, value: num(5), detail: 3,
    year: 2026, by: "Singapore Department of Statistics (2026)", min: 30,
  })),
  rank("SG", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Singapore",
    desc: "The tallest completed buildings in Singapore, by height.",
    unit: "metres", suffix: " m", decimals: 1,
  }, fromTable("SG", {
    page: "List of tallest buildings in Singapore", find: ["Rank", "Name", "Image", "Height (m)", "Height (ft)", "Floors", "Year"], name: 1, value: (r) => parseNum(r[2] === "" ? r[3] : r[2]),
    tidy: (n) => n.replace(/^\d{1,2}\.\d(?=\D)/, ""),
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 30, min: 5,
  })),
];
export default rankings;

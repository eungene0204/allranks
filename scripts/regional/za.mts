import { fromTable, rank } from "./lib.mts";
import { parseNum } from "../lib/wikipedia.mts";
import type { Pipeline } from "../lib/types.mts";

// South Africa — provinces, skyscrapers.

const usd = (cell: string | undefined, unit: RegExp) => parseNum(cell?.match(unit)?.[1]);
const P = { page: "List of South African provinces by GDP", find: ["Rank", "Province", "GDP (nominal, 2023)"] } as const;

const rankings: Pipeline[] = [
  rank("ZA", "province-gdp", {
    kind: "gdp", title: "South African Provinces by GDP",
    desc: "Gross domestic product of each province in 2023, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("ZA", { ...P, name: 1, value: (r) => usd(r[2], /US\$\s*([\d.,]+)\s*billion/), year: 2023, by: "Statistics South Africa (2023)", min: 8 })),
  rank("ZA", "province-gdp-per-capita", {
    kind: "gdp-pc", title: "South African Provinces by GDP per Capita",
    desc: "Gross domestic product per resident in 2023, in US dollars.",
    unit: "USD per person", prefix: "$",
  }, fromTable("ZA", { ...P, name: 1, value: (r) => usd(r[3], /US\$\s*([\d.,]+)\)/), year: 2023, by: "Statistics South Africa (2023)", min: 8 })),
  rank("ZA", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in South Africa",
    desc: "The tallest completed buildings in South Africa, by architectural height.",
    unit: "metres", suffix: " m",
  }, fromTable("ZA", {
    page: "List of tallest buildings in South Africa", find: ["Name", "Image", "Height (architectural)", "Floors", "Built", "City"], name: 0, value: (r) => parseNum(r[2]), detail: 5,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Nigeria — states, skyscrapers.

const rankings: Pipeline[] = [
  rank("NG", "state-population", {
    kind: "population", title: "Nigerian States by Population",
    desc: "Population of each state.",
    unit: "million people", suffix: "M", decimals: 1,
  }, fromTable("NG", {
    page: "List of Nigerian states by population", find: ["State", "Population", "Area (km)", "Density (2006)"], name: 0, value: num(2), scale: 1e-6, header: 2, tidy: (n) => n.replace(/ State$/, ""),
    year: 2023, by: "National Population Commission (2023 estimate)", min: 5,
  })),
  rank("NG", "state-gdp", {
    kind: "gdp", title: "Nigerian States by GDP",
    desc: "Estimated GDP of each state in 2021, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("NG", {
    page: "List of Nigerian states by GDP", find: ["Rank", "State", "GDP (tril. ₦)", "GDP (bil. US$)"], name: 1, value: num(3), tidy: (n) => n.replace(/ State$/, ""),
    year: 2021, by: "BudgIT (2021 estimate)", min: 25,
  })),
  rank("NG", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Nigeria",
    desc: "The tallest completed buildings in Nigeria, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("NG", {
    page: "List of tallest buildings in Nigeria", find: ["Building", "Height", "Floors", "Completed", "City"], name: 0, value: heightLead, detail: 4,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50, min: 5,
  })),
];
export default rankings;

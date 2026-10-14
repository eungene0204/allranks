import { fromTable, heightLead, rank } from "./lib.mts";
import { parseNum } from "../lib/wikipedia.mts";
import type { Pipeline } from "../lib/types.mts";

// Kenya — counties, skyscrapers.

const rankings: Pipeline[] = [
  rank("KE", "county-population", {
    kind: "population", title: "Kenyan Counties by Population",
    desc: "Population of each of Kenya's 47 counties at the 2019 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("KE", {
    page: "Counties of Kenya", find: ["Code", "County", "Former Province", "Population (2019 Census)"], name: 1, value: (r) => parseNum(r[r.length - 4]), scale: 1e-6,
    year: 2019, by: "Kenya National Bureau of Statistics (KNBS), 2019 census", min: 40,
  })),
  rank("KE", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Kenya",
    desc: "The tallest completed buildings in Kenya, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("KE", {
    page: "List of tallest buildings in Kenya", find: ["Rank", "Name", "Image", "Height m (ft)", "Floors", "Year", "City"], name: 1, value: heightLead, detail: 6,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 30, min: 5,
  })),
];
export default rankings;

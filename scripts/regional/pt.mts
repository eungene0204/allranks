import { fromTable, heightPair, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Portugal — municipalities, skyscrapers.

const rankings: Pipeline[] = [
  rank("PT", "municipalities", {
    kind: "cities", title: "Largest Municipalities in Portugal",
    desc: "The 100 most populous Portuguese municipalities at the 2021 census.",
    unit: "people",
  }, fromTable("PT", {
    page: "List of Portuguese municipalities by population", find: ["Position", "Municipality", "Subregion", "Region"], name: 1, value: num(4), detail: 3,
    year: 2021, by: "Statistics Portugal (INE), 2021 census", limit: 100, min: 50,
  })),
  rank("PT", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Portugal",
    desc: "The tallest completed buildings in Portugal, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("PT", {
    page: "List of tallest buildings in Portugal", find: ["Rank", "Name", "City", "Image", "Height (m)", "Height (ft)"], name: 1, value: heightPair, detail: 2,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 30, min: 5,
  })),
];
export default rankings;

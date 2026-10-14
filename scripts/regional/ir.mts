import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Iran — provinces, skyscrapers.

const rankings: Pipeline[] = [
  rank("IR", "province-population", {
    kind: "population", title: "Iranian Provinces by Population",
    desc: "Population of each province.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("IR", {
    page: "Provinces of Iran", find: ["Province", "Abbreviation", "Capital", "Population (2023)"], name: 0, value: num(3), scale: 1e-6, drop: /^Iran/,
    year: 2023, by: "Statistical Center of Iran (2023)", min: 5,
  })),
  rank("IR", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Iran",
    desc: "The tallest completed buildings in Iran, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("IR", {
    page: "List of tallest buildings in Iran", find: ["Rank", "Name", "Image", "City", "Height m (ft)", "Floors"], name: 1, value: heightLead, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50, min: 5,
  })),
];
export default rankings;

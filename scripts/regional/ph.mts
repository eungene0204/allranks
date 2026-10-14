import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Philippines — provinces, cities and municipalities, skyscrapers.

const rankings: Pipeline[] = [
  rank("PH", "province-population", {
    kind: "population", title: "Philippine Provinces by Population",
    desc: "Population of each province (and Metro Manila) at the 2024 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("PH", {
    page: "List of Philippine provinces by population", find: ["Rank", "Province", "Population", "% of Population", "Notes"], name: 1, value: num(2), scale: 1e-6, drop: /^Philippines$/,
    year: 2024, by: "Philippine Statistics Authority (PSA), 2024 census", min: 50,
  })),
  rank("PH", "cities", {
    kind: "cities", title: "Largest Cities and Municipalities in the Philippines",
    desc: "The 100 most populous Philippine cities and municipalities at the 2024 census.",
    unit: "people",
  }, fromTable("PH", {
    page: "List of cities and municipalities in the Philippines", find: ["City or municipality", "Population (2024)", "Area (km)", "PD (2024)", "Brgy."], name: 0, value: num(1), detail: 6,
    year: 2024, by: "Philippine Statistics Authority (PSA), 2024 census", limit: 100, min: 50,
  })),
  rank("PH", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in the Philippines",
    desc: "The tallest completed buildings in the Philippines, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("PH", {
    page: "List of tallest buildings in the Philippines", find: ["Rank", "Building", "Location", "Height", "Floors", "Year (est.)"], name: (r) => (/^[\d—–=]+$/.test(r[0].trim()) ? r[1] : r[0]), value: heightLead, detail: (r) => (/^[\d—–=]+$/.test(r[0].trim()) ? r[2] : r[1]),
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50, min: 5,
  })),
];
export default rankings;

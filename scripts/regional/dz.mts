import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Algeria — cities, skyscrapers.

const rankings: Pipeline[] = [
  rank("DZ", "cities", {
    kind: "cities", title: "Largest Cities in Algeria",
    desc: "Algerian cities ranked by municipal population at the 2008 census.",
    unit: "people",
  }, fromTable("DZ", {
    page: "List of cities in Algeria", find: ["#", "Arabic name", "2008 Municipal", "Wilaya"], name: 1, value: num(3), detail: 4,
    year: 2008, by: "Office National des Statistiques (ONS), 2008 census", limit: 40, min: 20,
  })),
  rank("DZ", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Algeria",
    desc: "The tallest completed buildings in Algeria, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("DZ", {
    page: "List of tallest buildings in Algeria", find: ["Rank", "Name", "Image", "Location", "Height m (ft)", "Floors", "Year"], name: 1, value: heightLead, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 20, min: 5,
  })),
];
export default rankings;

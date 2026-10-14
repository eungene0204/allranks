import { combine, fromTable, heightOf, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Cyprus — cities and municipalities, skyscrapers.

const rankings: Pipeline[] = [
  rank("CY", "cities", {
    kind: "cities", title: "Largest Cities in Cyprus",
    desc: "The district capitals (urban population) and municipalities of the Republic of Cyprus, 2021 census.",
    unit: "people",
  }, combine(
    fromTable("CY", {
      page: "List of cities, towns and villages in Cyprus", find: ["Name (en)", "District", "Population (urban)(2021)"], name: 0, value: num(2), detail: 1,
      year: 2021, by: "Statistical Service of Cyprus (CYSTAT), 2021 census", min: 5,
    }),
    fromTable("CY", {
      page: "List of cities, towns and villages in Cyprus", find: ["Name (en)", "District", "Population (2021)", "Area"], name: 0, value: num(2), detail: 1, drop: /^(Nicosia|Limassol|Larnaca|Paphos|Famagusta|Kyrenia)$/,
      year: 2021, by: "Statistical Service of Cyprus (CYSTAT), 2021 census", min: 10,
    }),
  )),
  rank("CY", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Cyprus",
    desc: "The tallest completed buildings in Cyprus, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("CY", {
    page: "List of tallest buildings in Cyprus", find: ["Rank", "Name", "Image", "City", "Height", "Floors", "Year built"], name: 1, value: heightOf, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 30, min: 5,
  })),
];
export default rankings;

import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Tunisia — municipalities, governorates.

const rankings: Pipeline[] = [
  rank("TN", "municipalities", {
    kind: "cities", title: "Largest Municipalities in Tunisia",
    desc: "The 60 most populous Tunisian municipalities at the 2024 census.",
    unit: "people",
  }, fromTable("TN", {
    page: "List of cities in Tunisia", find: ["Governorate", "Code", "Municipality", "Population (2024)"], name: -2, value: num(-1),
    year: 2024, by: "National Institute of Statistics (INS), 2024 census", limit: 60, min: 50,
  })),
  rank("TN", "governorate-population", {
    kind: "population", title: "Tunisian Governorates by Population",
    desc: "Population of each of Tunisia's 24 governorates at the 2024 census.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("TN", {
    page: "Governorates of Tunisia", find: ["Key", "Governorate", "Population (2024)", "Area (km)"], name: 1, value: num(2), scale: 1e-6, detail: 5,
    year: 2024, by: "National Institute of Statistics (INS), 2024 census", min: 20,
  })),
];
export default rankings;

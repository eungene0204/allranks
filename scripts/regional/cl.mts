import { afterYear, fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Chile — regions, skyscrapers, airports.

const rankings: Pipeline[] = [
  rank("CL", "region-population", {
    kind: "population", title: "Chilean Regions by Population",
    desc: "Population of the 16 regions.",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("CL", {
    page: "Ranked lists of Chilean regions", find: ["Region", "Men", "Women", "Total"], name: 0, value: num(3), scale: 1e-6, drop: /^Chile$/,
    year: 2024, by: "Instituto Nacional de Estadísticas (INE) Chile", min: 12,
  })),
  rank("CL", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Chile",
    desc: "The tallest completed buildings in Chile, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("CL", {
    page: "List of tallest buildings in Chile", find: ["Rank", "Name", "Image", "Height m (ft)", "Floors", "City"], name: 1, value: heightLead, detail: afterYear, 
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("CL", "airports", {
    kind: "airports", title: "Busiest Airports in Chile",
    desc: "Chilean airports ranked by passengers handled.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("CL", {
    page: "List of the busiest airports in Chile", find: ["Rank", "Airport", "IATA code", "Passengers"], name: 1, value: (r) => Number(String(r[4]).replace(/[\',.]/g, "")), detail: 3, scale: 1e-6,
    year: 2023, by: "Junta de Aeronáutica Civil (JAC), Chile (2023)", limit: 15, min: 10,
  })),
];
export default rankings;

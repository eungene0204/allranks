import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Vietnam — cities, skyscrapers, airports.

const rankings: Pipeline[] = [
  rank("VN", "cities", {
    kind: "cities", title: "Largest Cities in Vietnam",
    desc: "Vietnam's centrally governed and provincial cities ranked by population (2025).",
    unit: "people",
  }, fromTable("VN", {
    page: "List of cities in Vietnam", find: ["City", "Vietnamese", "Seal", "Year of recognition", "2025 Population"], name: 0, value: (r) => Number(String(r[r.length - 1]).replace(/[.,]/g, "")), detail: 4, header: 2,
    year: 2025, by: "General Statistics Office of Vietnam (2025)", min: 5,
  })),
  rank("VN", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Vietnam",
    desc: "The tallest completed buildings in Vietnam, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("VN", {
    page: "List of tallest buildings in Vietnam", find: ["Building", "Image", "Province", "District", "Ward", "Height (m)"], name: 0, value: (r) => {
      // Metres and feet sit side by side, with a decimal comma: "461,2" "1513".
      for (let i = 0; i < r.length - 1; i++) {
        const a = Number(r[i].replace(",", "."));
        const b = Number(r[i + 1].replace(",", "."));
        if (a > 20 && Math.abs(b / a - 3.2808) < 0.05) return a;
      }
      return NaN;
    }, detail: 2,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50, min: 5,
  })),
  rank("VN", "airports", {
    kind: "airports", title: "Busiest Airports in Vietnam",
    desc: "Vietnamese airports ranked by passengers in 2025.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("VN", {
    page: "List of the busiest airports in Vietnam", find: ["No.", "Airport name", "Province", "2025"], name: 1, value: num(-1), detail: 3, scale: 1e-6,
    year: 2025, by: "Civil Aviation Authority of Vietnam (2025)", limit: 25, min: 8,
  })),
];
export default rankings;

import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Luxembourg — communes.

const rankings: Pipeline[] = [
  rank("LU", "communes", {
    kind: "cities", title: "Largest Communes in Luxembourg",
    desc: "Luxembourg's communes ranked by population (2026).",
    unit: "people",
  }, fromTable("LU", {
    page: "List of communes of Luxembourg", find: ["Luxembourgish", "Canton", "Population (2026)"], name: 1, value: num(3), detail: 2, header: 2,
    // Cells read "Beaufort Beefort" (French name, Luxembourgish name): keep the French one.
    tidy: (n) => n.split(" ").slice(0, Math.ceil(n.split(" ").length / 2)).join(" ") === n.split(" ").slice(Math.floor(n.split(" ").length / 2)).join(" ") ? n : n.replace(/^(.+?) \S+$/, "$1"),
    year: 2026, by: "STATEC Luxembourg (2026)", limit: 60, min: 30,
  })),
];
export default rankings;

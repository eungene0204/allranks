import { heightPair, dedupeRomaji, fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// United Kingdom — regions, skyscrapers, airports, universities.

const UNI = {
  page: "Rankings of universities in the United Kingdom", find: ["Pos", "University", "Average", "Guardian", "Times"],
  name: 1, value: num(2), asc: true, tidy: dedupeRomaji, year: 2026,
  by: "Complete University Guide, The Guardian and The Times / Sunday Times league tables",
} as const;

const rankings: Pipeline[] = [
  rank("GB", "universities", {
    kind: "universities", title: "Top Universities in the United Kingdom",
    desc: "UK universities by the average of their positions in the three main national league tables (lower is better).",
    unit: "average league-table position", decimals: 1, order: "asc",
  }, async () => {
    const [top, rest] = await Promise.all([fromTable("GB", { ...UNI, limit: 100 })(), fromTable("GB", { ...UNI, skip: 1, limit: 100 })().catch(() => undefined)]);
    return { ...top, items: [...top.items, ...(rest?.items ?? [])].filter((i, n, all) => all.findIndex((j) => j.name === i.name) === n) };
  }),
  rank("GB", "region-gdp", {
    kind: "gdp", title: "UK Regions by GDP",
    desc: "Gross regional domestic product of the nine English regions plus Wales, Scotland and Northern Ireland, in billions of pounds.",
    unit: "GBP billion", prefix: "£", suffix: "B", decimals: 0,
  }, fromTable("GB", {
    page: "List of regions of the United Kingdom by GRDP", find: ["Region", "Population", "GRDP per head"], name: 0, value: num(2), scale: 1e-3, header: 2,
    drop: /^(United Kingdom|Extra-regio)/, year: 2023, by: "Office for National Statistics, regional gross domestic product", min: 10,
  })),
  rank("GB", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "UK Regions by GDP per Head",
    desc: "Economic output per resident of each UK region, in pounds.",
    unit: "GBP per person", prefix: "£",
  }, fromTable("GB", {
    page: "List of regions of the United Kingdom by GRDP", find: ["Region", "Population", "GRDP per head"], name: 0, value: num(4), header: 2,
    drop: /^(United Kingdom|Extra-regio)/, year: 2023, by: "Office for National Statistics, regional gross domestic product", min: 10,
  })),
  rank("GB", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in the United Kingdom",
    desc: "The tallest completed buildings in the UK, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("GB", {
    page: "List of tallest buildings in the United Kingdom", find: ["Rank", "Official name", "Alternative names", "Height (m)"], name: 1, value: heightPair, detail: 4,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("GB", "airports", {
    kind: "airports", title: "Busiest Airports in the United Kingdom",
    desc: "UK airports ranked by total passengers in 2025.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("GB", {
    page: "List of the busiest airports in the United Kingdom", find: ["Rank 2025", "Airport", "Total passengers"], name: 1, value: num(3), scale: 1e-6, header: 2,
    year: 2025, by: "UK Civil Aviation Authority, airport statistics (2025)", limit: 40,
  })),
];
export default rankings;

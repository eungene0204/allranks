import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Egypt — governorates, skyscrapers.

const BY = "Ministry of Planning and Economic Development (2021)";

const rankings: Pipeline[] = [
  rank("EG", "governorate-gdp", {
    kind: "gdp", title: "Egyptian Governorates by GDP",
    desc: "Gross domestic product of each governorate in 2021, in billions of international dollars (purchasing power parity).",
    unit: "intl. USD billion (PPP)", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("EG", {
    page: "List of governorates of Egypt by GDP", find: ["Rank", "Governorate", "GDP in millions of Int$ (P"], name: 1, value: num(3), scale: 1e-3, drop: /^Egypt$/, year: 2021, by: BY, min: 20,
  })),
  rank("EG", "governorate-gdp-per-capita", {
    kind: "gdp-pc", title: "Egyptian Governorates by GDP per Capita",
    desc: "Gross domestic product per resident in 2021, in international dollars (PPP).",
    unit: "intl. USD per person (PPP)", prefix: "$",
  }, fromTable("EG", {
    page: "List of governorates of Egypt by GDP", find: ["Rank", "Governorate", "Population (2021)"], name: 1, value: num(5), drop: /^Egypt$/, year: 2021, by: BY, min: 20,
  })),
  rank("EG", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Egypt",
    desc: "The tallest completed buildings in Egypt, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("EG", {
    page: "List of tallest buildings in Egypt", find: ["Rank", "Name", "Image", "City", "Height m (ft)", "Floors"], name: 1, value: heightLead, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

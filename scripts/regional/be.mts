import { eurostatRegionalGdp } from "../sources/eurostat-regional-gdp.mts";
import { fromTable, heightLead, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Belgium — provinces, skyscrapers.

const GDP_REGIONS = {
  BE10: "Brussels",
  BE21: "Antwerp",
  BE22: "Limburg",
  BE23: "East Flanders",
  BE24: "Flemish Brabant",
  BE25: "West Flanders",
  BE31: "Walloon Brabant",
  BE32: "Hainaut",
  BE33: "Liège",
  BE34: "Luxembourg",
  BE35: "Namur",
};

const rankings: Pipeline[] = [
  rank("BE", "province-gdp", {
    kind: "gdp", title: "Belgian Provinces by GDP",
    desc: "Nominal GDP of the ten provinces and the Brussels-Capital Region, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 1,
  }, eurostatRegionalGdp("BE", 2, GDP_REGIONS, "MIO_EUR")),
  rank("BE", "province-gdp-per-capita", {
    kind: "gdp-pc", title: "Belgian Provinces by GDP per Capita",
    desc: "Nominal GDP per resident, in euros.",
    unit: "EUR per person", prefix: "€",
  }, eurostatRegionalGdp("BE", 2, GDP_REGIONS, "EUR_HAB")),
  rank("BE", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Belgium",
    desc: "The tallest completed buildings in Belgium, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("BE", {
    page: "List of tallest buildings in Belgium", find: ["Rank", "Name", "Place", "Height", "Floors", "Year"], name: 1, value: heightLead, detail: 2, keep: (r) => !/\d\s*m\b/.test(r[2] ?? ""),
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

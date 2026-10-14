import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Switzerland — cantons, towns, skyscrapers.

const rankings: Pipeline[] = [
  rank("CH", "canton-gdp", {
    kind: "gdp", title: "Swiss Cantons by GDP",
    desc: "Gross regional domestic product of each canton, in billions of Swiss francs.",
    unit: "CHF billion", prefix: "CHF ", suffix: "B", decimals: 1,
  }, fromTable("CH", {
    page: "List of Swiss cantons by GRDP", find: ["Rank", "Canton", "GRDP in (billions of CHF)"], name: 1, value: num(2), drop: /^Switzerland$/,
    year: 2022, by: "Swiss Federal Statistical Office (FSO), cantonal accounts", min: 20,
  })),
  rank("CH", "canton-gdp-per-capita", {
    kind: "gdp-pc", title: "Swiss Cantons by GDP per Capita",
    desc: "Gross regional domestic product per resident, in Swiss francs.",
    unit: "CHF per person", prefix: "CHF ",
  }, fromTable("CH", {
    page: "List of Swiss cantons by GRDP", find: ["Rank", "Canton", "GRDP per capita (in CHF)"], name: 1, value: num(2), drop: /^Switzerland$/,
    year: 2022, by: "Swiss Federal Statistical Office (FSO), cantonal accounts", min: 20,
  })),
  rank("CH", "cities", {
    kind: "cities", title: "Largest Towns in Switzerland",
    desc: "The 100 most populous Swiss towns (2020).",
    unit: "people",
  }, fromTable("CH", {
    page: "List of cities in Switzerland", find: ["Town", "District", "Canton", "Population", "Agglomeration"], name: 0, value: (r) => Number(String(r[4]).replace(/,/g, "")), detail: 3, header: 2,
    year: 2020, by: "Swiss Federal Statistical Office (FSO), 2020", limit: 100,
  })),
  rank("CH", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Switzerland",
    desc: "The tallest completed buildings in Switzerland, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("CH", {
    page: "List of tallest buildings in Switzerland", find: ["Name", "Image", "Height m (ft)", "Floors", "Location"], name: 0, value: heightLead,
    detail: (r) => (r[r.length - 2] ?? "").replace(/\s*\d.*$/, ""),
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

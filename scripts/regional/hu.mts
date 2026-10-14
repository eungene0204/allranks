import { combine, fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Hungary — counties, cities, skyscrapers.

const rankings: Pipeline[] = [
  rank("HU", "county-gdp", {
    kind: "gdp", title: "Hungarian Counties by GDP",
    desc: "Gross domestic product of each county and Budapest in 2022, in billions of international dollars (PPP).",
    unit: "intl. USD billion (PPP)", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("HU", {
    page: "List of Hungarian counties by GDP", find: ["Rank", "County", "GDP in mil HUF"], name: 1, value: num(3), scale: 1e-3, drop: /^Hungary$/,
    year: 2022, by: "OECD regional statistics (2022)", min: 15,
  })),
  rank("HU", "county-gdp-per-capita", {
    kind: "gdp-pc", title: "Hungarian Counties by GDP per Capita",
    desc: "Gross domestic product per resident in 2022, in international dollars (PPP).",
    unit: "intl. USD per person (PPP)", prefix: "$",
  }, fromTable("HU", {
    page: "List of Hungarian counties by GDP", find: ["Rank", "County", "GDP per capita in HUF"], name: 1, value: num(3), drop: /^Hungary$/,
    year: 2022, by: "OECD regional statistics (2022)", min: 15,
  })),
  rank("HU", "cities", {
    kind: "cities", title: "Largest Cities in Hungary",
    desc: "The biggest Hungarian cities at the 2022 census.",
    unit: "people",
  }, combine(
    ...[0, 1].map((skip) =>
      fromTable("HU", {
        page: "List of cities and towns of Hungary", find: ["City / town", "County", "Peak population"], skip, name: 1, value: num(6), detail: 2, header: 2,
        year: 2022, by: "Hungarian Central Statistical Office, 2022 census", min: 5,
      }),
    ),
  )),
  rank("HU", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Hungary",
    desc: "The tallest completed buildings in Hungary, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("HU", {
    page: "List of tallest buildings in Hungary", find: ["Name", "City", "Height m (ft)", "Floors", "Year built", "Use"], name: 0, value: heightLead, detail: 1, 
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

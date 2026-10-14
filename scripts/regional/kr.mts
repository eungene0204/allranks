import { afterYear, combine, fromTable, heightOf, nameCell, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// South Korea — provinces and metropolitan cities, cities, skyscrapers, airports, companies.

const GDP_PAGE = "List of South Korean regions by GDP";
const BY = "Statistics Korea, regional income accounts (2024)";
const tidyRegion = (n: string) => n.replace(/ Province, South Korea$/, "").replace(/ (Province|Special Self-Governing Province|Special Self-Governing City)$/, "");

/** The nine provinces and the eight metropolitan cities sit in two tables with the same columns. */
const regions = (col: number, scale = 1) =>
  combine(
    ...["Province", "City"].map((head) =>
      fromTable("KR", { page: GDP_PAGE, find: ["Rank", head, "Per capita"], name: 1, value: num(col), tidy: tidyRegion, scale, year: 2024, by: BY, min: 5 }),
    ),
  );

const rankings: Pipeline[] = [
  rank("KR", "gdp", {
    kind: "gdp", title: "South Korean Regions by GDP",
    desc: "Economic output of the nine provinces and the special and metropolitan cities, in current US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, regions(3)),
  rank("KR", "gdp-per-capita", {
    kind: "gdp-pc", title: "South Korean Regions by GDP per Capita",
    desc: "Economic output per resident of each province and metropolitan city, in current US dollars.",
    unit: "USD per person", prefix: "$", decimals: 0,
  }, regions(5)),
  rank("KR", "cities", {
    kind: "cities", title: "Largest Cities in South Korea",
    desc: "Cities and metropolitan cities ranked by population at the 2020 census.",
    unit: "people",
  }, fromTable("KR", {
    page: "List of cities in South Korea", find: ["Rank", "Division", "2020"], name: 1, value: num(3), detail: (r) => r[2].replace(/[()]/g, ""),
    year: 2020, by: "Statistics Korea, 2020 population census", limit: 100,
  })),
  rank("KR", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in South Korea",
    desc: "The tallest completed buildings in South Korea, by architectural height.",
    unit: "metres", suffix: " m",
  }, fromTable("KR", {
    page: "List of tallest buildings in South Korea", find: ["Rank", "Name", "Floors", "Year", "City"], name: nameCell, value: heightOf, detail: afterYear,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("KR", "airports", {
    kind: "airports", title: "Busiest Airports in South Korea",
    desc: "Airports ranked by passengers handled in 2024.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("KR", {
    page: "List of the busiest airports in South Korea", find: ["Rank", "Airport", "Operations"], name: 1, value: num(4), detail: 2, scale: 1e-6,
    year: 2024, by: "Korea Airports Corporation / Incheon International Airport Corporation, final statistics (2024)",
  })),
  rank("KR", "companies", {
    kind: "companies", title: "Largest Companies in South Korea",
    desc: "The biggest Korean companies by revenue (Fortune Global 500, 2023 list).",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("KR", {
    page: "List of largest companies of South Korea", find: ["National rank", "Global rank", "Revenue"], name: 2, value: num(5), detail: 3,
    year: 2023, by: "Fortune Global 500 (2023)", note: "Wikipedia's most recent Korean company table is the 2023 Fortune list.",
  })),
];

export default rankings;

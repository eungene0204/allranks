import { eurostatRegionalGdp } from "../sources/eurostat-regional-gdp.mts";
import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Poland — regions, cities, skyscrapers, airports.

const GDP_REGIONS = {
  PL21: "Lesser Poland Voivodeship",
  PL22: "Silesian Voivodeship",
  PL41: "Greater Poland Voivodeship",
  PL42: "West Pomeranian Voivodeship",
  PL43: "Lubusz Voivodeship",
  PL51: "Lower Silesian Voivodeship",
  PL52: "Opole Voivodeship",
  PL61: "Kuyavian-Pomeranian Voivodeship",
  PL62: "Warmian-Masurian Voivodeship",
  PL63: "Pomeranian Voivodeship",
  PL71: "Łódź Voivodeship",
  PL72: "Świętokrzyskie Voivodeship",
  PL81: "Lublin Voivodeship",
  PL82: "Subcarpathian Voivodeship",
  PL84: "Podlaskie Voivodeship",
  PL91: "Warsaw metropolitan area",
  PL92: "Masovian Regional",
};

const rankings: Pipeline[] = [
  rank("PL", "region-gdp", {
    kind: "gdp", title: "Polish Regions by GDP",
    desc: "Gross domestic product of the NUTS-2 regions, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 1,
  }, eurostatRegionalGdp("PL", 2, GDP_REGIONS, "MIO_EUR")),
  rank("PL", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "Polish Regions by GDP per Capita",
    desc: "Gross domestic product per resident of the NUTS-2 regions, in euros.",
    unit: "EUR per person", prefix: "€",
  }, eurostatRegionalGdp("PL", 2, GDP_REGIONS, "EUR_HAB")),
  rank("PL", "cities", {
    kind: "cities", title: "Largest Cities in Poland",
    desc: "The 80 most populous Polish cities and towns (June 2024).",
    unit: "people",
  }, fromTable("PL", {
    page: "List of cities and towns in Poland", find: ["Name", "Voivodeship", "30 Jun 2024"], name: 0, value: num(2), detail: 1,
    year: 2024, by: "Statistics Poland (GUS), 30 June 2024", limit: 100,
  })),
  rank("PL", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Poland",
    desc: "The tallest completed buildings in Poland, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("PL", {
    page: "List of tallest buildings in Poland", find: ["Rank", "Name", "Image", "City", "Height", "Floors"], name: 1, value: heightLead, detail: 3,
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
];
export default rankings;

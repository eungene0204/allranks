import { parseNum } from "../lib/wikipedia.mts";
import { fromTable, heightLead, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Colombia — departments, skyscrapers, airports.

const rankings: Pipeline[] = [
  rank("CO", "department-gdp", {
    kind: "gdp", title: "Colombian Departments by GDP",
    desc: "Gross domestic product of each department and Bogotá, in billions of US dollars.",
    unit: "USD billion", prefix: "$", suffix: "B", decimals: 1,
  }, fromTable("CO", {
    page: "List of Colombian departments by GDP", find: ["Department", "Population (2020)", "GDP (bil. US$)"], name: 0, value: num(3),
    drop: /^Colombia$/, year: 2020, by: "DANE, departmental accounts", min: 25,
  })),
  rank("CO", "department-gdp-per-capita", {
    kind: "gdp-pc", title: "Colombian Departments by GDP per Capita",
    desc: "Gross domestic product per resident, in US dollars.",
    unit: "USD per person", prefix: "$",
  }, fromTable("CO", {
    page: "List of Colombian departments by GDP", find: ["Department", "Population (2020)", "GDP (bil. US$)"], name: 0, value: (r) => parseNum(r[5]) * 1000,
    drop: /^Colombia$/, year: 2020, by: "DANE, departmental accounts", min: 25,
  })),
  rank("CO", "department-population", {
    kind: "population", title: "Colombian Departments by Population",
    desc: "Population of each department and Bogotá (2020).",
    unit: "million people", suffix: "M", decimals: 2,
  }, fromTable("CO", {
    page: "List of Colombian departments by GDP", find: ["Department", "Population (2020)", "GDP (bil. US$)"], name: 0, value: num(1), scale: 1e-6,
    drop: /^Colombia$/, year: 2020, by: "DANE, 2020 population estimates", min: 25,
  })),
  rank("CO", "skyscrapers", {
    kind: "skyscrapers", title: "Tallest Buildings in Colombia",
    desc: "The tallest completed buildings in Colombia, by height.",
    unit: "metres", suffix: " m",
  }, fromTable("CO", {
    page: "List of tallest buildings in Colombia", find: ["Rank", "Name", "Image", "Location", "Height m (ft)", "Floors"], name: 1, value: heightLead, detail: 3, 
    year: new Date().getFullYear(), by: "Council on Tall Buildings and Urban Habitat / Emporis", limit: 50,
  })),
  rank("CO", "airports", {
    kind: "airports", title: "Busiest Airports in Colombia",
    desc: "Colombian airports ranked by total passengers in 2024.",
    unit: "million passengers", suffix: "M", decimals: 1,
  }, fromTable("CO", {
    page: "List of the busiest airports in Colombia", find: ["Rank", "Airport", "Location", "Total passengers"], name: 1, value: (r) => Number(String(r[3]).replace(/[\',.]/g, "")), detail: 2, scale: 1e-6,
    year: 2024, by: "Aerocivil, Colombia (2024)", limit: 16, min: 10,
  })),
];
export default rankings;

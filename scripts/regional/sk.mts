import { eurostatRegionalGdp } from "../sources/eurostat-regional-gdp.mts";
import { fromTable, num, rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Slovakia — regions, cities.

const GDP_REGIONS = {
  SK010: "Bratislava Region",
  SK021: "Trnava Region",
  SK022: "Trenčín Region",
  SK023: "Nitra Region",
  SK031: "Žilina Region",
  SK032: "Banská Bystrica Region",
  SK041: "Prešov Region",
  SK042: "Košice Region",
};

const rankings: Pipeline[] = [
  rank("SK", "region-gdp", {
    kind: "gdp", title: "Slovak Regions by GDP",
    desc: "Gross domestic product of the eight regions, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 1,
  }, eurostatRegionalGdp("SK", 3, GDP_REGIONS, "MIO_EUR")),
  rank("SK", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "Slovak Regions by GDP per Capita",
    desc: "Gross domestic product per resident, in euros.",
    unit: "EUR per person", prefix: "€",
  }, eurostatRegionalGdp("SK", 3, GDP_REGIONS, "EUR_HAB")),
  rank("SK", "cities", {
    kind: "cities", title: "Largest Cities in Slovakia",
    desc: "The 100 most populous Slovak cities and towns (2019).",
    unit: "people",
  }, fromTable("SK", {
    page: "List of cities and towns in Slovakia", find: ["City or town", "District", "Region", "Population"], name: 1, value: num(4), detail: 3, header: 2,
    year: 2019, by: "Statistical Office of the Slovak Republic (2019)", limit: 100, min: 50,
  })),
];
export default rankings;

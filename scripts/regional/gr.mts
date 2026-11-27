import { eurostatRegionalGdp } from "../sources/eurostat-regional-gdp.mts";
import { rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Greece — regions, skyscrapers.

const GDP_REGIONS = {
  EL30: "Attica",
  EL41: "North Aegean",
  EL42: "South Aegean",
  EL43: "Crete",
  EL51: "Eastern Macedonia and Thrace",
  EL52: "Central Macedonia",
  EL53: "Western Macedonia",
  EL54: "Epirus",
  EL61: "Thessaly",
  EL62: "Ionian Islands",
  EL63: "Western Greece",
  EL64: "Central Greece",
  EL65: "Peloponnese",
};

const rankings: Pipeline[] = [
  rank("GR", "region-gdp", {
    kind: "gdp", title: "Greek Regions by GDP",
    desc: "Gross domestic product of the 13 regions, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 1,
  }, eurostatRegionalGdp("GR", 2, GDP_REGIONS, "MIO_EUR")),
  rank("GR", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "Greek Regions by GDP per Capita",
    desc: "Gross domestic product per resident, in euros.",
    unit: "EUR per person", prefix: "€",
  }, eurostatRegionalGdp("GR", 2, GDP_REGIONS, "EUR_HAB")),
];
export default rankings;

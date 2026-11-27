import { eurostatRegionalGdp } from "../sources/eurostat-regional-gdp.mts";
import { rank } from "./lib.mts";
import type { Pipeline } from "../lib/types.mts";

// Finland — regions.

const GDP_REGIONS = {
  FI196: "Satakunta",
  FI198: "Central Finland",
  FI199: "Southern Ostrobothnia",
  FI19A: "Ostrobothnia",
  FI19B: "Pirkanmaa",
  FI1B1: "Helsinki-Uusimaa",
  FI1C1: "Southwest Finland",
  FI1C2: "Kanta-Häme",
  FI1C5: "South Karelia",
  FI1C6: "Päijät-Häme",
  FI1C7: "Kymenlaakso",
  FI1D5: "Central Ostrobothnia",
  FI1D7: "Lapland",
  FI1D8: "Kainuu",
  FI1D9: "North Ostrobothnia",
  FI1DA: "South Savo",
  FI1DB: "North Savo",
  FI1DC: "North Karelia",
  FI200: "Åland",
};

const rankings: Pipeline[] = [
  rank("FI", "region-gdp", {
    kind: "gdp", title: "Finnish Regions by GDP",
    desc: "Gross domestic product of each region, in billions of euros.",
    unit: "EUR billion", prefix: "€", suffix: "B", decimals: 1,
  }, eurostatRegionalGdp("FI", 3, GDP_REGIONS, "MIO_EUR")),
  rank("FI", "region-gdp-per-capita", {
    kind: "gdp-pc", title: "Finnish Regions by GDP per Capita",
    desc: "Gross domestic product per resident, in euros.",
    unit: "EUR per person", prefix: "€",
  }, eurostatRegionalGdp("FI", 3, GDP_REGIONS, "EUR_HAB")),
];
export default rankings;

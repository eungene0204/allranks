import { owid } from "./sources/owid.mts";
import type { Pipeline } from "./lib/types.mts";

// Uncommon country comparisons with reproducible, single-year public data.
// Supply measures are deliberately named "supply": they do not measure what people actually ate.
export const ODDITIES: Pipeline[] = [
  {
    meta: { id: "cocoa-supply-per-person", title: "Cocoa Supply per Person", category: "world", icon: "🍫", desc: "Cocoa beans and cocoa products available for food per person in a year. This is food supply, not chocolate eaten after household waste.", unit: "kg per person per year", prefix: "", suffix: " kg", decimals: 1, order: "desc" },
    fetch: owid({ slug: "chocolate-consumption-per-person", name: "FAO Food Balances, via Our World in Data", note: "Cocoa beans and products available for food. Supply includes food later wasted by consumers; countries are compared in the same year." }),
    minYear: 2023,
  },
  {
    meta: { id: "egg-supply-per-person", title: "Egg Supply per Person", category: "world", icon: "🥚", desc: "Eggs available for food per person in a year, measured by egg weight in the shell. Household waste is included in the supply figure.", unit: "kg per person per year", prefix: "", suffix: " kg", decimals: 1, order: "desc" },
    fetch: owid({ slug: "per-capita-egg-consumption-kilograms-per-year", name: "FAO Food Balances, via Our World in Data", note: "Eggs in shell-equivalent weight available for food, rather than eggs actually eaten. Consumer waste is not deducted." }),
    minYear: 2023,
  },
  {
    meta: { id: "seafood-supply-per-person", title: "Seafood Supply per Person", category: "world", icon: "🐟", desc: "Fish and seafood available for food per person in a year. This is supply before household waste, not a dietary survey.", unit: "kg per person per year", prefix: "", suffix: " kg", decimals: 1, order: "desc" },
    fetch: owid({ slug: "fish-and-seafood-consumption-per-capita", name: "FAO Food Balances, via Our World in Data", note: "Fish and seafood available for food. Consumer waste is not deducted." }),
    minYear: 2023,
  },
  {
    meta: { id: "milk-supply-per-person", title: "Milk & Dairy Supply per Person", category: "world", icon: "🥛", desc: "Milk and dairy products, excluding butter, available for food per person in a year, expressed as milk equivalent. This does not measure milk drunk.", unit: "kg per person per year", prefix: "", suffix: " kg", decimals: 1, order: "desc" },
    fetch: owid({ slug: "per-capita-milk-consumption", name: "FAO Food Balances, via Our World in Data", note: "Milk-equivalent supply including dairy products but excluding butter. Consumer waste is not deducted." }),
    minYear: 2023,
  },
  {
    meta: { id: "beer-alcohol-per-adult", title: "Beer Alcohol per Adult", category: "society", icon: "🍺", desc: "Litres of pure alcohol from beer recorded per person aged 15 or older in a year. This is alcohol content, not litres of beer purchased.", unit: "litres of pure alcohol per adult 15+", prefix: "", suffix: " L", decimals: 2, order: "desc" },
    fetch: owid({ slug: "beer-consumption-per-person", name: "WHO Global Health Observatory, via Our World in Data", note: "Recorded beer alcohol, expressed as litres of pure alcohol per person aged 15+. Unrecorded drinking is excluded." }),
    minYear: 2022,
  },
  {
    meta: { id: "household-food-waste-per-person", title: "Household Food Waste per Person", category: "society", icon: "🗑️", desc: "Estimated kilograms of food wasted by households per person in a year. Retail and restaurants are excluded.", unit: "kg per person per year", prefix: "", suffix: " kg", decimals: 0, order: "desc" },
    fetch: owid({ slug: "food-waste-per-capita", column: "_12_3_1__ag_food_wst_pc__households", name: "UNEP Food Waste Index, via Our World in Data", note: "Household food-waste estimates; many countries rely on modeled or low-confidence observations. Retail and food service are excluded." }),
    minYear: 2022,
  },
  {
    meta: { id: "retail-food-waste-per-person", title: "Retail Food Waste per Person", category: "society", icon: "🛒", desc: "Estimated kilograms of food wasted at retail per person in a year. Household and restaurant waste are excluded.", unit: "kg per person per year", prefix: "", suffix: " kg", decimals: 0, order: "desc" },
    fetch: owid({ slug: "food-waste-per-capita", column: "_12_3_1__ag_food_wst_pc__retail", name: "UNEP Food Waste Index, via Our World in Data", note: "Retail food-waste estimates; many countries rely on modeled or low-confidence observations. Household and food-service waste are excluded." }),
    minYear: 2022,
  },
  {
    meta: { id: "plastic-waste-imports-per-person", title: "Plastic Waste Imports per Person", category: "world", icon: "♻️", desc: "Reported imports of plastic waste and scrap per person in one year. Covers customs code HS 3915 and countries that reported trade data.", unit: "kg per person per year", prefix: "", suffix: " kg", decimals: 1, order: "desc" },
    fetch: owid({ slug: "plastic-waste-trade", column: "import_total_mot_per_capita", params: { metric: "imports", rate: "per_capita" }, name: "UN Comtrade, via Our World in Data", note: "Customs code HS 3915 only. Missing reports and plastic waste traded under other codes are excluded; latest single year, without filling gaps from earlier years." }),
    minYear: 2024,
  },
  {
    meta: { id: "plastic-waste-exports-per-person", title: "Plastic Waste Exports per Person", category: "world", icon: "🚢", desc: "Reported exports of plastic waste and scrap per person in one year. Covers customs code HS 3915 and countries that reported trade data.", unit: "kg per person per year", prefix: "", suffix: " kg", decimals: 1, order: "desc" },
    fetch: owid({ slug: "plastic-waste-trade", column: "export_total_mot_per_capita", params: { metric: "exports", rate: "per_capita" }, name: "UN Comtrade, via Our World in Data", note: "Customs code HS 3915 only. Missing reports and plastic waste traded under other codes are excluded; latest single year, without filling gaps from earlier years." }),
    minYear: 2024,
  },
  {
    meta: { id: "space-objects-launched-annual", title: "Annual Objects Launched into Space", category: "tech", icon: "🛰️", desc: "Satellites, probes, landers, crewed spacecraft and station elements launched into orbit or beyond in a year, attributed to the commissioning country rather than the launch site.", unit: "space objects", prefix: "", suffix: "", decimals: 0, order: "desc" },
    fetch: owid({ slug: "yearly-number-of-objects-launched-into-outer-space", column: "annual_launches", name: "UN Office for Outer Space Affairs, via Our World in Data", note: "Based on national registrations; UN estimates about 88% of all launched objects are covered. Joint objects count in each participating country's series." }),
    minYear: 2025,
  },
];

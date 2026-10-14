// Usage: node scripts/map-codes.mts — refresh data/map-codes.json: the shape names of the world-atlas map → ISO 3166-1 alpha-2.
// The ranking pages colour a world map by country code; this file is the only link between the map's shapes and our countries.
import { readFileSync, writeFileSync } from "node:fs";
import { loadCountries } from "./lib/countries.mts";

// The atlas abbreviates some names ("Dem. Rep. Congo"); these are fixed by ISO code, not guessed.
const ABBREVIATED: Record<string, string> = {
  "W. Sahara": "EH", "Dem. Rep. Congo": "CD", "Dominican Rep.": "DO", "Falkland Is.": "FK", "Fr. S. Antarctic Lands": "TF",
  "Central African Rep.": "CF", "Eq. Guinea": "GQ", "Solomon Is.": "SB", "Bosnia and Herz.": "BA", "S. Sudan": "SS",
};
// Not countries in our list (disputed or unrecognised areas); they stay grey on the map.
const NO_DATA = new Set(["N. Cyprus", "Somaliland"]);

const countries = loadCountries();
const atlas = JSON.parse(readFileSync(new URL("../node_modules/world-atlas/countries-110m.json", import.meta.url), "utf8"));
const map: Record<string, string> = {};
const missing: string[] = [];
for (const g of atlas.objects.countries.geometries as { properties: { name: string } }[]) {
  const name = g.properties.name;
  const code = ABBREVIATED[name] ?? countries.byName(name)?.code;
  if (code) map[name] = code;
  else if (!NO_DATA.has(name)) missing.push(name);
}
if (missing.length) throw new Error(`Unmatched map shapes: ${missing.join(", ")}`);
writeFileSync(new URL("../data/map-codes.json", import.meta.url), JSON.stringify(map, null, 1) + "\n");
console.log(`✓ data/map-codes.json updated (${Object.keys(map).length} shapes)`);

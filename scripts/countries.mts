// Usage: node scripts/countries.mts   — refresh data/countries.json (ISO codes, names, coordinates).
import { refreshCountries } from "./lib/countries.mts";

console.log(`✓ data/countries.json updated (${await refreshCountries()} countries)`);

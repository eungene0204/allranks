import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { getJson } from "./http.mts";
import type { Country, CountryIndex } from "./types.mts";

export const COUNTRIES_FILE = new URL("../../data/countries.json", import.meta.url);
const SOURCE_URL = "https://raw.githubusercontent.com/mledoze/countries/master/dist/countries.json";

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim().replace(/^the /, "");

/** Names used by data publishers that the reference dataset doesn't list. normalised name -> ISO2 */
const NAME_OVERRIDES: Record<string, string> = {
  turkiye: "TR", "czech republic": "CZ", "ivory coast": "CI", "cote d ivoire": "CI", "dr congo": "CD",
  "democratic republic of congo": "CD", "democratic republic of the congo": "CD", "republic of the congo": "CG",
  congo: "CG", "east timor": "TL", "cape verde": "CV", swaziland: "SZ", burma: "MM", palestine: "PS",
  "state of palestine": "PS", "palestinian territories": "PS", "vatican city": "VA", "hong kong sar": "HK",
  "macao": "MO", "macau sar": "MO", "south korea": "KR", "korea south": "KR", "republic of korea": "KR", "korea rep": "KR",
  "north korea": "KP", russia: "RU", "russian federation": "RU", vietnam: "VN", "viet nam": "VN", laos: "LA", syria: "SY",
  iran: "IR", moldova: "MD", bolivia: "BO", venezuela: "VE", tanzania: "TZ", brunei: "BN", micronesia: "FM",
  "the gambia": "GM", gambia: "GM", "the bahamas": "BS", bahamas: "BS", "north macedonia": "MK", macedonia: "MK",
  curacao: "CW", kosovo: "XK", "saint martin": "MF", "sint maarten": "SX", "united states of america": "US",
  "uk": "GB", "uae": "AE", "slovak republic": "SK", "kyrgyz republic": "KG", "egypt arab rep": "EG", "yemen rep": "YE",
  "gambia the": "GM", "bahamas the": "BS", "turkey": "TR", taiwan: "TW", "china": "CN",
};

export function buildIndex(all: Country[]): CountryIndex {
  const byCode3 = new Map(all.map((c) => [c.code3, c]));
  const byCode2 = new Map(all.map((c) => [c.code, c]));
  const names = new Map<string, Country>();
  // Common names first so they win over another country's alias.
  for (const c of all) names.set(norm(c.name), c);
  for (const c of all) for (const n of [c.official, ...c.aliases]) if (n.length > 2 && !names.has(norm(n))) names.set(norm(n), c);
  return {
    all, byCode3, byCode2,
    byName: (name) => {
      const k = norm(name);
      const code = NAME_OVERRIDES[k];
      return (code && byCode2.get(code)) || names.get(k);
    },
  };
}

export function loadCountries(): CountryIndex {
  if (!existsSync(COUNTRIES_FILE)) throw new Error("data/countries.json is missing — run `npm run data:countries` first.");
  return buildIndex(JSON.parse(readFileSync(COUNTRIES_FILE, "utf8")) as Country[]);
}

type Raw = {
  name: { common: string; official: string; native?: Record<string, { common: string; official: string }> };
  cca2: string; cca3: string; altSpellings: string[]; latlng: [number, number]; region: string; independent: boolean;
};

/** Refresh data/countries.json from the open mledoze/countries dataset. */
export async function refreshCountries(): Promise<number> {
  const raw = await getJson<Raw[]>(SOURCE_URL);
  const countries: Country[] = raw
    .filter((r) => r.latlng?.length === 2)
    .map((r) => ({
      code: r.cca2, code3: r.cca3, name: r.name.common, official: r.name.official,
      aliases: [...new Set([...r.altSpellings, ...Object.values(r.name.native ?? {}).flatMap((n) => [n.common, n.official])])]
        .filter((a) => a && a !== r.cca2 && a !== r.cca3),
      lat: r.latlng[0], lng: r.latlng[1], region: r.region, independent: !!r.independent,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
  if (countries.length < 200) throw new Error(`Only ${countries.length} countries came back; refusing to overwrite.`);
  writeFileSync(COUNTRIES_FILE, JSON.stringify(countries, null, 1) + "\n");
  return countries.length;
}

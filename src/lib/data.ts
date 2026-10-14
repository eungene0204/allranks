import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { CATEGORIES, getCategory } from "./categories";
import { flagEmoji, formatValue, ranked } from "./format";
import type { CountrySummary, RankedEntry, Ranking } from "./types";

// Everything here reads data/*.json (written by the pipeline in scripts/) at build time.
const DATA_DIR = path.join(process.cwd(), "data");
const readJson = <T>(...p: string[]) => JSON.parse(readFileSync(path.join(DATA_DIR, ...p), "utf8")) as T;

type CountryRow = { code: string; name: string; lat: number; lng: number; region?: string };

let rankingsCache: Ranking[] | undefined;
let countriesCache: Map<string, CountryRow> | undefined;

export function allRankings(): Ranking[] {
  if (rankingsCache && process.env.NODE_ENV === "production") return rankingsCache;
  const order = (r: Ranking) => CATEGORIES.findIndex((c) => c.id === r.category);
  rankingsCache = readdirSync(path.join(DATA_DIR, "rankings"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJson<Ranking>("rankings", f))
    .sort((a, b) => order(a) - order(b) || (a.sort ?? 99) - (b.sort ?? 99) || a.title.localeCompare(b.title));
  return rankingsCache;
}

const countries = () =>
  (countriesCache ??= new Map(readJson<CountryRow[]>("countries.json").map((c) => [c.code, c])));

/** Name and world region of a country code, for generated text. */
export const countryInfo = (code: string) => {
  const c = countries().get(code);
  return c ? { name: c.name, region: c.region ?? "" } : undefined;
};

/** Latitude/longitude of a country's centre point, for placing bubbles on the map. */
export const countryCoords = (code: string) => {
  const c = countries().get(code);
  return c ? { lat: c.lat, lng: c.lng } : undefined;
};

export const getRanking = (id: string) => allRankings().find((r) => r.id === id);
export const rankingsIn = (categoryId: string) => allRankings().filter((r) => r.category === categoryId);

/** Every country that appears in at least one ranking, best performers first. */
export const countrySummaries = cache(function countrySummaries(): CountrySummary[] {
  const rankings = allRankings();
  const map = new Map<string, CountrySummary>();
  for (const r of rankings) {
    // Regional rankings (US states…) are listed on the country's own page and never count toward world totals.
    if (r.scope) continue;
    for (const e of ranked(r)) {
      const geo = countries().get(e.country);
      if (!geo) continue;
      const s =
        map.get(e.country) ??
        { code: e.country, flag: flagEmoji(e.country), name: geo.name, lat: geo.lat, lng: geo.lng, firsts: 0, top3: 0, appearances: [], regional: [] };
      if (e.rank === 1) s.firsts++;
      if (e.rank <= 3) s.top3++;
      // Entries come best-first, so the first one seen for a ranking is the country's best.
      const seen = s.appearances.find((a) => a.id === r.id);
      if (seen) seen.count++;
      else
        s.appearances.push({
          id: r.id, title: r.title, icon: r.icon, rank: e.rank, entry: e.name, logo: e.logo,
          value: formatValue(r, e.value), count: 1,
        });
      map.set(e.country, s);
    }
  }
  const list = [...map.values()];
  for (const s of list) {
    s.appearances.sort((a, b) => a.rank - b.rank);
    s.regional = rankings
      .filter((r) => r.scope === s.code)
      .map((r) => ({ id: r.id, title: r.title, short: r.short ?? r.title, icon: r.icon }));
  }
  return list.sort(
    (a, b) =>
      b.firsts - a.firsts || b.top3 - a.top3 || b.appearances.length - a.appearances.length || a.name.localeCompare(b.name),
  );
});

const searchText = (value: string) => value.normalize("NFKC").toLowerCase();

export function searchCountries(query: string): CountrySummary[] {
  const q = searchText(query.trim());
  if (!q) return [];
  return countrySummaries().filter((c) => searchText(c.name).includes(q) || c.code.toLowerCase() === q);
}

export function searchRankings(query: string): Ranking[] {
  const q = searchText(query.trim());
  if (!q) return [];
  return allRankings().filter((r) =>
    [r.title, r.short ?? "", r.desc, getCategory(r.category)?.name ?? "",
      ...r.items.flatMap((i) => [i.name, i.detail ?? "", countries().get(i.country)?.name ?? ""]),
    ].some((value) => searchText(value).includes(q)) || r.items.some((i) => i.country.toLowerCase() === q),
  );
}

/** Matching entries retain their position in the complete ranking. */
export function searchEntries(query: string) {
  const q = searchText(query.trim());
  if (!q) return [];
  return allRankings().flatMap((r) => ranked(r)
    .filter((e) => [e.name, e.detail ?? ""].some((value) => searchText(value).includes(q)))
    .map((entry) => ({ ranking: r, entry })));
}

/** A world ranking, narrowed to the entries that belong to one country. */
export type CountryRankingRow = {
  ranking: Ranking;
  total: number;
  entries: (RankedEntry & { formatted: string })[];
};

/** One headline figure of a country (population, GDP…) with its place in the matching world ranking. */
export type KeyStat = { id: string; label: string; icon: string; value: string; rank: number; total: number };

/** The world rankings whose figures head every country page, in display order. */
const KEY_STATS: [id: string, label: string][] = [
  ["population", "Population"],
  ["gdp-nominal", "GDP"],
  ["gdp-per-capita", "GDP per capita"],
  ["life-expectancy", "Life expectancy"],
  ["land-area", "Area"],
];

export type CountryDetail = {
  summary: CountrySummary;
  region: string;
  /** Headline figures, for the ones the country has data for. */
  keyStats: KeyStat[];
  /** World rankings that include the country, best placement first. */
  world: CountryRankingRow[];
  /** Rankings that exist only inside this country (its states, cities, universities…). */
  regional: Ranking[];
};

export const countryCodes = () => countrySummaries().map((c) => c.code);

export const countryDetail = cache(function countryDetail(code: string): CountryDetail | undefined {
  const summary = countrySummaries().find((c) => c.code === code);
  if (!summary) return undefined;
  const rankings = allRankings();
  const world: CountryRankingRow[] = [];
  for (const r of rankings) {
    if (r.scope) continue;
    const all = ranked(r);
    const entries = all.filter((e) => e.country === code).map((e) => ({ ...e, formatted: formatValue(r, e.value) }));
    if (entries.length) world.push({ ranking: r, total: all.length, entries });
  }
  world.sort((a, b) => a.entries[0].rank - b.entries[0].rank || a.ranking.title.localeCompare(b.ranking.title));
  const keyStats: KeyStat[] = [];
  for (const [id, label] of KEY_STATS) {
    const r = getRanking(id);
    if (!r) continue;
    const all = ranked(r);
    const e = all.find((x) => x.country === code);
    if (e) keyStats.push({ id, label, icon: r.icon, value: formatValue(r, e.value), rank: e.rank, total: all.length });
  }
  return {
    summary,
    region: countries().get(code)?.region ?? "",
    keyStats,
    world,
    regional: rankings.filter((r) => r.scope === code),
  };
});

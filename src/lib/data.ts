import "server-only";
import { readdirSync, readFileSync, statSync } from "node:fs";
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
let rankingsSignature = "";
let rankingsCheckedAt = 0;

export function allRankings(): Ranking[] {
  if (rankingsCache && (process.env.NODE_ENV === "production" || Date.now() - rankingsCheckedAt < 1000)) return rankingsCache;
  const files = readdirSync(path.join(DATA_DIR, "rankings")).filter((file) => file.endsWith(".json")).sort();
  const signature = process.env.NODE_ENV === "production" ? "production" : files.map((file) => {
    const stat = statSync(path.join(DATA_DIR, "rankings", file));
    return `${file}:${stat.mtimeMs}:${stat.size}`;
  }).join("|");
  rankingsCheckedAt = Date.now();
  if (rankingsCache && signature === rankingsSignature) return rankingsCache;
  rankingsSignature = signature;
  const order = (r: Ranking) => CATEGORIES.findIndex((c) => c.id === r.category);
  rankingsCache = files
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

const summariesCache = new WeakMap<Ranking[], CountrySummary[]>();

/** Every country that appears in at least one ranking, best performers first. */
export const countrySummaries = cache(function countrySummaries(): CountrySummary[] {
  const rankings = allRankings();
  const cached = summariesCache.get(rankings);
  if (cached) return cached;
  const map = new Map<string, CountrySummary>();
  for (const r of rankings) {
    // Regional rankings (US states…) are listed on the country's own page and never count toward world totals.
    if (r.scope) continue;
    const seenCountries = new Map<string, CountrySummary["appearances"][number]>();
    for (const e of ranked(r)) {
      const geo = countries().get(e.country);
      if (!geo) continue;
      const s =
        map.get(e.country) ??
        { code: e.country, flag: flagEmoji(e.country), name: geo.name, lat: geo.lat, lng: geo.lng, firsts: 0, top3: 0, appearances: [], regional: [] };
      if (e.rank === 1) s.firsts++;
      if (e.rank <= 3) s.top3++;
      // Entries come best-first, so the first one seen for a ranking is the country's best.
      const seen = seenCountries.get(e.country);
      if (seen) seen.count++;
      else {
        const appearance = {
          id: r.id, title: r.title, icon: r.icon, rank: e.rank, entry: e.name, logo: e.logo,
          value: formatValue(r, e.value), count: 1,
        };
        s.appearances.push(appearance);
        seenCountries.set(e.country, appearance);
      }
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
  list.sort(
    (a, b) =>
      b.firsts - a.firsts || b.top3 - a.top3 || b.appearances.length - a.appearances.length || a.name.localeCompare(b.name),
  );
  summariesCache.set(rankings, list);
  return list;
});

const searchText = (value: string) => value.normalize("NFKC").toLowerCase();
const searchWords = (value: string) => searchText(value).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
const matchesSearch = (value: string, query: string) => {
  const normalized = searchText(value);
  return normalized.includes(query) || searchWords(normalized).some((word) => word.startsWith(query));
};

type SearchField = { text: string; label: string; priority: number };
let rankingSearchIndex: { ranking: Ranking; fields: SearchField[] }[] | undefined;

/** Country names and matching entries explain why a ranking is suggested. */
export function suggestRankings(query: string, limit = 6) {
  const q = searchText(query.trim());
  if (!q) return [];
  rankingSearchIndex ??= allRankings().map((ranking) => {
    const field = (label: string, priority: number): SearchField => ({ text: searchText(label), label, priority });
    const countryNames = new Set(ranking.items.map((item) => countries().get(item.country)?.name ?? ""));
    return {
      ranking,
      fields: [
        field(ranking.title, 0), field(ranking.short ?? "", 1),
        field(ranking.scope ? countries().get(ranking.scope)?.name ?? "" : "", 1),
        ...ranking.items.map((item) => field(item.name, 2)),
        ...[...countryNames].map((name) => field(name, 3)),
        field(ranking.id, 4), field(getCategory(ranking.category)?.name ?? "", 4),
      ],
    };
  });
  return rankingSearchIndex
    .map(({ ranking, fields }) => {
      let score = Infinity;
      let match = "";
      for (const field of fields) {
        if (!field.text.includes(q)) continue;
        const quality = field.text === q ? 0 : searchWords(field.text).some((word) => word.startsWith(q)) ? 1 : 2;
        const candidate = quality * 10 + field.priority;
        if (candidate < score) { score = candidate; match = field.label; }
      }
      return { ranking, score, match };
    })
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => a.score - b.score || a.ranking.title.localeCompare(b.ranking.title))
    .slice(0, limit)
    .map(({ ranking, match }) => ({
      href: `/ranking/${ranking.id}`, title: ranking.title,
      detail: [match !== ranking.title ? match : "", getCategory(ranking.category)?.name ?? ""].filter(Boolean).join(" · "),
    }));
}

/** Avoid the expensive country ranking aggregation for lightweight suggestions. */
export function suggestCountries(query: string, limit = 4) {
  const q = searchText(query.trim());
  if (!q) return [];
  return [...countries().values()]
    .filter((country) => matchesSearch(country.name, q) || searchText(country.code) === q)
    .sort((a, b) => Number(searchText(b.name).startsWith(q)) - Number(searchText(a.name).startsWith(q)) || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((country) => ({ href: `/country/${country.code}`, title: country.name, detail: "Country rankings" }));
}

type SearchCountry = { code: string; name: string; flag: string; worldCount: number; regionalCount: number };
type CatalogSearchIndex = {
  rankings: { ranking: Ranking; text: string; codes: Set<string> }[];
  entries: { ranking: Ranking; entry: RankedEntry; text: string }[];
  countries: SearchCountry[];
};
let catalogSearchIndex: CatalogSearchIndex | undefined;
let catalogSearchIndexTime = 0;

/** Reuse normalized fields and ranks; never rebuild all country detail pages for search. */
function getCatalogSearchIndex(): CatalogSearchIndex {
  if (catalogSearchIndex && (process.env.NODE_ENV === "production" || Date.now() - catalogSearchIndexTime < 5000)) return catalogSearchIndex;
  const index: CatalogSearchIndex = { rankings: [], entries: [], countries: [] };
  const counts = new Map<string, { worldCount: number; regionalCount: number }>();
  for (const ranking of allRankings()) {
    const codes = new Set(ranking.items.map((item) => item.country.toLowerCase()));
    index.rankings.push({ ranking, codes, text: searchText([
      ranking.id, ranking.title, ranking.short ?? "", ranking.desc, ranking.unit,
      ranking.source.name, ranking.source.note ?? "", getCategory(ranking.category)?.name ?? "",
      ...ranking.items.flatMap((item) => [item.name, item.detail ?? "", countries().get(item.country)?.name ?? ""]),
    ].join("\0")) });
    if (ranking.scope) {
      const count = counts.get(ranking.scope) ?? { worldCount: 0, regionalCount: 0 };
      count.regionalCount++;
      counts.set(ranking.scope, count);
    } else {
      for (const code of new Set(ranking.items.map((item) => item.country))) {
        const count = counts.get(code) ?? { worldCount: 0, regionalCount: 0 };
        count.worldCount++;
        counts.set(code, count);
      }
    }
    for (const entry of ranked(ranking)) {
      index.entries.push({ ranking, entry, text: searchText(`${entry.name}\0${entry.detail ?? ""}`) });
    }
  }
  index.countries = [...countries().values()].filter((country) => counts.has(country.code)).map((country) => ({
    code: country.code, name: country.name, flag: flagEmoji(country.code), ...counts.get(country.code)!,
  }));
  catalogSearchIndex = index;
  catalogSearchIndexTime = Date.now();
  return index;
}

export function searchCountries(query: string): SearchCountry[] {
  const q = searchText(query.trim());
  if (!q) return [];
  return getCatalogSearchIndex().countries.filter((c) => matchesSearch(c.name, q) || c.code.toLowerCase() === q);
}

export function searchRankings(query: string): Ranking[] {
  const q = searchText(query.trim());
  if (!q) return [];
  return getCatalogSearchIndex().rankings.filter((row) => row.text.includes(q) || row.codes.has(q)).map((row) => row.ranking);
}

/** Matching entries retain their position in the complete ranking. */
export function searchEntries(query: string) {
  const q = searchText(query.trim());
  if (!q) return [];
  return getCatalogSearchIndex().entries.filter((row) => row.text.includes(q));
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

const countryDetailsCache = new WeakMap<Ranking[], Map<string, CountryDetail>>();
export const countryDetail = cache(function countryDetail(code: string): CountryDetail | undefined {
  const rankings = allRankings();
  let details = countryDetailsCache.get(rankings);
  if (!details) { details = new Map(); countryDetailsCache.set(rankings, details); }
  const cached = details.get(code);
  if (cached) return cached;
  const summary = countrySummaries().find((c) => c.code === code);
  if (!summary) return undefined;
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
  const detail: CountryDetail = {
    summary,
    region: countries().get(code)?.region ?? "",
    keyStats,
    world,
    regional: rankings.filter((r) => r.scope === code),
  };
  details.set(code, detail);
  return detail;
});

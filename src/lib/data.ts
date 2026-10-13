import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { CATEGORIES, getCategory } from "./categories";
import { flagEmoji, formatValue, ranked } from "./format";
import type { CountrySummary, Ranking } from "./types";

// Everything here reads data/*.json (written by the pipeline in scripts/) at build time.
const DATA_DIR = path.join(process.cwd(), "data");
const readJson = <T>(...p: string[]) => JSON.parse(readFileSync(path.join(DATA_DIR, ...p), "utf8")) as T;

type CountryRow = { code: string; name: string; lat: number; lng: number };

let rankingsCache: Ranking[] | undefined;
let countriesCache: Map<string, CountryRow> | undefined;

export function allRankings(): Ranking[] {
  if (rankingsCache && process.env.NODE_ENV === "production") return rankingsCache;
  const order = (r: Ranking) => CATEGORIES.findIndex((c) => c.id === r.category);
  rankingsCache = readdirSync(path.join(DATA_DIR, "rankings"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJson<Ranking>("rankings", f))
    .sort((a, b) => order(a) - order(b) || a.title.localeCompare(b.title));
  return rankingsCache;
}

const countries = () =>
  (countriesCache ??= new Map(readJson<CountryRow[]>("countries.json").map((c) => [c.code, c])));

export const getRanking = (id: string) => allRankings().find((r) => r.id === id);
export const rankingsIn = (categoryId: string) => allRankings().filter((r) => r.category === categoryId);

/** Every country that appears in at least one ranking, best performers first. */
export function countrySummaries(): CountrySummary[] {
  const map = new Map<string, CountrySummary>();
  for (const r of allRankings()) {
    for (const e of ranked(r)) {
      const geo = countries().get(e.country);
      if (!geo) continue;
      const s =
        map.get(e.country) ??
        { code: e.country, flag: flagEmoji(e.country), name: geo.name, lat: geo.lat, lng: geo.lng, firsts: 0, top3: 0, appearances: [] };
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
  for (const s of list) s.appearances.sort((a, b) => a.rank - b.rank);
  return list.sort(
    (a, b) =>
      b.firsts - a.firsts || b.top3 - a.top3 || b.appearances.length - a.appearances.length || a.name.localeCompare(b.name),
  );
}

export function searchRankings(query: string): Ranking[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return allRankings().filter((r) =>
    [r.title, r.desc, getCategory(r.category)?.name ?? "", ...r.items.map((i) => i.name)].join(" ").toLowerCase().includes(q),
  );
}

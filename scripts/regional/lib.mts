import { parseNum, wikiHtml, wikiTables } from "../lib/wikipedia.mts";
import type { WikiTable } from "../lib/wikipedia.mts";
import type { Fetched, Item, Meta, Pipeline } from "../lib/types.mts";

// Shared helpers for the per-country rankings in scripts/regional/<cc>.mts. A country module declares
// its rankings with `rank()` (metadata) and `fromTable()` (which Wikipedia table, which columns).

const LICENSE = "CC BY-SA 4.0 (Wikipedia); underlying data © the cited publisher";

export const wikiUrl = (title: string) => `https://en.wikipedia.org/wiki/${title.replace(/ /g, "_")}`;

/** "Tokyo[a]" / "Seoul †" → "Tokyo" / "Seoul". */
export const text = (s: string | undefined) =>
  (s ?? "").replace(/\[[^\]]*\]/g, "").replace(/[†‡*]+/g, "").replace(/\s+/g, " ").trim();

/** "555.7 m (1,823 ft)" or "1,776 ft (541 m)" → metres. */
export function metres(cell: string | undefined): number {
  const m = (cell ?? "").match(/([\d,.]+)\s*m(?:etres?)?\b/);
  if (m) return parseNum(m[1]);
  const ft = (cell ?? "").match(/([\d,.]+)\s*ft/);
  return ft ? parseNum(ft[1]) * 0.3048 : NaN;
}

/** First cell of the row that looks like a height ("123 m", "404 (1,325)"). */
export const heightOf = (r: string[]) => {
  for (const c of r.slice(1)) {
    const v = metres(c);
    if (Number.isFinite(v)) return v;
  }
  return NaN;
};

/** Column index, or a function reading the row. Negative indices count from the end. */
export type Col<T> = number | ((row: string[]) => T);
const pick = <T,>(c: Col<T>, row: string[]): T | string =>
  typeof c === "function" ? c(row) : row[c < 0 ? row.length + c : c];

export type TableSpec = {
  /** Wikipedia article title. */
  page: string;
  /** Fragments that must all appear in the table's caption / first rows. */
  find: readonly string[];
  /** Skip the first n matching tables (e.g. to take a second table with the same header). */
  skip?: number;
  name: Col<string>;
  value: Col<number>;
  detail?: Col<string | undefined>;
  /** Multiplier applied to the value (e.g. 1e-9 to get billions). */
  scale?: number;
  /** Only rows for which this returns true are used (e.g. to skip a row-spanned total). */
  keep?: (row: string[]) => boolean;
  /** Rows whose cleaned name matches are dropped ("Total", "Japan", …). */
  drop?: RegExp;
  /** Final tidy-up of each name ("Tokyo-to" → "Tokyo"). */
  tidy?: (name: string) => string;
  /** The best row has the lowest value (e.g. a world rank). */
  asc?: boolean;
  /** Keep only the first n rows after sorting. */
  limit?: number;
  year: number | ((t: WikiTable) => number);
  /** Publisher of the numbers, e.g. "Statistics Korea". */
  by: string;
  note?: string;
  /** Rows to skip at the top of the table (default 1: the header). */
  header?: number;
  /** Fewest rows to accept (default 5) — guards against a changed table layout. */
  min?: number;
};

/** Summary rows that every table seems to have. */
const TOTAL = /^(total|totals|all|sum)$/i;

const unique = (items: Item[]): Item[] => {
  const seen = new Map<string, number>();
  return items.map((i) => {
    const n = (seen.get(i.name) ?? 0) + 1;
    seen.set(i.name, n);
    return n === 1 ? i : { ...i, name: `${i.name} (${i.detail ?? n})` };
  });
};

export const fromTable = (country: string, spec: TableSpec) => async (): Promise<Fetched> => {
  const tables = wikiTables(await wikiHtml(spec.page));
  let t: WikiTable | undefined;
  let skip = spec.skip ?? 0;
  for (const c of tables) {
    const head = (c.caption + " " + c.rows.slice(0, 3).map((r) => r.join(" ")).join(" ")).toLowerCase();
    if (spec.find.every((f) => head.includes(f.toLowerCase())) && skip-- <= 0) {
      t = c;
      break;
    }
  }
  if (!t) throw new Error(`table with "${spec.find.join('", "')}" not found on "${spec.page}" — the Wikipedia layout probably changed`);
  const items: Item[] = [];
  for (const row of t.rows.slice(spec.header ?? 1)) {
    if (spec.keep && !spec.keep(row)) continue;
    let name: string;
    let value: number;
    let detail: string | undefined;
    try {
      name = text(String(pick(spec.name, row) ?? ""));
      value = Number(pick(spec.value, row)) * (spec.scale ?? 1);
      detail = spec.detail ? text(String(pick(spec.detail, row) ?? "")) || undefined : undefined;
    } catch {
      continue;
    }
    if (spec.tidy) name = spec.tidy(name);
    if (!/\p{L}/u.test(name) || !Number.isFinite(value) || TOTAL.test(name) || spec.drop?.test(name)) continue;
    if (items.some((i) => i.name === name) && !spec.detail) continue; // header repeats / footnote rows
    items.push({ name, country, value, ...(detail ? { detail } : {}) });
  }
  items.sort((a, b) => (spec.asc ? a.value - b.value : b.value - a.value));
  const kept = unique(spec.limit ? items.slice(0, spec.limit) : items);
  if (kept.length < (spec.min ?? 5)) throw new Error(`only ${kept.length} rows from "${spec.page}" — the Wikipedia layout probably changed`);
  return {
    year: typeof spec.year === "function" ? spec.year(t) : spec.year,
    source: {
      kind: "wikipedia",
      name: `${spec.by} (via Wikipedia)`,
      url: wikiUrl(spec.page),
      license: LICENSE,
      ...(spec.note ? { note: spec.note } : {}),
    },
    items: kept,
  };
};

/** Cheapest way to read a number: the nth cell, thousands separators removed. */
export const num = (i: Col<string>): Col<number> => (r) => parseNum(String(pick(i, r) ?? ""));

type Kind = "population" | "gdp" | "gdp-pc" | "cities" | "universities" | "companies" | "skyscrapers" | "airports" | "area" | "other";

/** Look & feel shared by the same kind of ranking in every country, so the tabs read alike. */
const KINDS: Record<Kind, { short: string; category: string; icon: string; sort?: number }> = {
  population: { short: "Population", category: "society", icon: "👥" },
  gdp: { short: "GDP", category: "economy", icon: "💰" },
  "gdp-pc": { short: "GDP per capita", category: "economy", icon: "💹" },
  cities: { short: "Cities", category: "society", icon: "🌆" },
  universities: { short: "Universities", category: "education", icon: "🎓", sort: 1 },
  companies: { short: "Companies", category: "economy", icon: "🏢" },
  skyscrapers: { short: "Skyscrapers", category: "world", icon: "🏙️" },
  airports: { short: "Airports", category: "world", icon: "✈️" },
  area: { short: "Area", category: "world", icon: "🗺️" },
  other: { short: "", category: "society", icon: "📊" },
};

export type RankOpts = Partial<Pick<Meta, "short" | "category" | "icon" | "sort" | "order">> & {
  /** What kind of list this is; sets the tab label, category and icon unless overridden. */
  kind: Kind;
  title: string;
  desc: string;
  unit: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Regional reference series can be useful even when the latest national release predates the global 2025 cutoff. */
  minYear?: number;
};

/** Declare one regional ranking: id is `<cc>-<slug>`, scoped to the country. */
export function rank(country: string, slug: string, o: RankOpts, fetch: Pipeline["fetch"]): Pipeline {
  const k = KINDS[o.kind];
  return {
    meta: {
      id: `${country.toLowerCase()}-${slug}`,
      title: o.title,
      short: o.short ?? k.short,
      ...((o.sort ?? k.sort) ? { sort: o.sort ?? k.sort } : {}),
      category: o.category ?? k.category,
      icon: o.icon ?? k.icon,
      desc: o.desc,
      unit: o.unit,
      prefix: o.prefix ?? "",
      suffix: o.suffix ?? "",
      decimals: o.decimals ?? 0,
      order: o.order ?? "desc",
      scope: country,
    },
    fetch,
    minYear: o.minYear ?? 2020,
  };
}

/** First cell that is a name, not a rank or number — tables with row-spanned rank cells shift their columns. */
export const nameCell = (r: string[]) => r.find((c) => /[^\d\s.,=#—–-]/.test(text(c)) && text(c).length > 1) ?? "";

/** The cell right after the 4-digit year cell ("2017" → the city column), for tables whose leading columns vary. */
export const afterYear = (r: string[]) => {
  const i = r.findIndex((c) => /^(1[89]|20)\d\d$/.test(c));
  return i >= 0 ? r[i + 1] : undefined;
};

/** Merge several fetches into one ranking (e.g. provinces + metropolitan cities); year/source come from the first. */
export const combine = (...fns: (() => Promise<Fetched>)[]) => async (): Promise<Fetched> => {
  const parts = await Promise.all(fns.map((f) => f()));
  return { ...parts[0], items: parts.flatMap((p) => p.items) };
};

/** First number written like "3,677,472" at or after cell `from` — for tables whose columns shift when a cell is row-spanned. */
export const bigNum = (from: number): Col<number> => (r) => {
  const c = r.slice(from).find((x) => /^\d{1,3}(,\d{3})+$/.test(x.trim()));
  return c ? parseNum(c) : NaN;
};

const plain = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Wikipedia renders some romanised names twice, plain then with diacritics ("AnjoAnjō") → "Anjō". */
export function dedupeRomaji(name: string): string {
  const twice = name.match(/^(.+) \1$/); // "St Andrews St Andrews"
  if (twice) return twice[1];
  for (let i = 2; i <= name.length - 2; i++) {
    const a = name.slice(0, i);
    const b = name.slice(i);
    if (a.length === b.length && plain(a) === plain(b)) return b;
  }
  return name;
}

/**
 * Height in metres for tables that list "Height (m)" next to "Height (ft)" — found as the pair of adjacent numbers
 * whose ratio is 3.28 — so row-spanned cells (which shift the columns) don't matter.
 */
export const heightPair = (r: string[]): number => {
  for (let i = 0; i < r.length - 1; i++) {
    const a = parseNum(r[i]);
    const b = parseNum(r[i + 1]);
    if (/^[\d,.]+$/.test(r[i].trim()) && Number.isFinite(a) && a > 20 && Math.abs(b / a - 3.2808) < 0.05) return a;
  }
  return NaN;
};

/** "322.5 (1,058)", "305.3 m (1,002 ft)" or "294,1" (decimal comma) → the leading metre figure of the first cell that has one. */
export const heightLead = (r: string[]): number => {
  for (const c of r.slice(1)) {
    const t = c.trim();
    const m = t.match(/^(\d[\d,.]*)\s*(?:m|metres?|meters?)?\s*\(\s*[\d,.]+\s*(?:ft)?\s*\)/);
    if (m) return /^\d+,\d{1,2}$/.test(m[1]) ? Number(m[1].replace(",", ".")) : parseNum(m[1]);
    if (/^\d{2,3},\d{1,2}$/.test(t)) return Number(t.replace(",", "."));
  }
  return NaN;
};

/** First 2–3 digit figure (optionally with a decimal point or comma) from the third cell on — a height when it precedes the floor count. */
export const firstMetres = (r: string[]): number => {
  const c = r.slice(2).find((x) => /^\d{2,3}(?:[.,]\d{1,2})?$/.test(x.trim()));
  return c ? Number(c.trim().replace(",", ".")) : NaN;
};

/** The cell right after the name cell (the city, when the rank cell is row-spanned away). */
export const afterName = (r: string[]) => {
  const n = nameCell(r);
  return r[r.indexOf(n) + 1];
};

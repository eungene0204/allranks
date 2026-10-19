import type { RankedEntry, Ranking } from "./types";

/** ISO alpha-2 code → flag emoji (regional-indicator letters). */
export const flagEmoji = (code: string) =>
  String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

/** Entries sorted by the ranking's order, each with its 1-based rank. */
const rankedCache = new WeakMap<Ranking, RankedEntry[]>();
export function ranked(r: Ranking): RankedEntry[] {
  const cached = rankedCache.get(r);
  if (cached) return cached;
  const entries = [...r.items]
    .sort((a, b) => (r.order === "asc" ? a.value - b.value : b.value - a.value) || a.name.localeCompare(b.name))
    .map((e, i) => ({
      rank: i + 1,
      name: e.name,
      country: e.country ?? "",
      flag: e.country ? flagEmoji(e.country) : "",
      value: e.value,
      logo: e.logo ? `/logos/${e.logo}.png` : undefined,
      detail: e.detail,
    }));
  rankedCache.set(r, entries);
  return entries;
}

const numberFormats = new Map<number, Intl.NumberFormat>();
export function formatValue(r: Pick<Ranking, "prefix" | "suffix" | "decimals" | "unit">, v: number): string {
  if (r.unit === "yes/no (1=yes)") return v === 1 ? "Yes" : "No";
  // Keep small nonzero values from looking like zero (e.g. 0.041 million
  // people must not render as 0.0M). Preserve the ranking's precision unless
  // that precision would round a nonzero value to zero.
  let decimals = r.decimals;
  while (v !== 0 && decimals < 6 && Math.round(Math.abs(v) * 10 ** decimals) === 0) decimals++;
  let formatter = numberFormats.get(decimals);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    numberFormats.set(decimals, formatter);
  }
  return (
    r.prefix +
    formatter.format(v) +
    r.suffix
  );
}

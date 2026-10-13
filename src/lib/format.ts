import type { RankedEntry, Ranking } from "./types";

/** ISO alpha-2 code → flag emoji (regional-indicator letters). */
export const flagEmoji = (code: string) =>
  String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

/** Entries sorted by the ranking's order, each with its 1-based rank. */
export function ranked(r: Ranking): RankedEntry[] {
  return [...r.items]
    .sort((a, b) => (r.order === "asc" ? a.value - b.value : b.value - a.value) || a.name.localeCompare(b.name))
    .map((e, i) => ({
      rank: i + 1,
      name: e.name,
      country: e.country,
      flag: flagEmoji(e.country),
      value: e.value,
      logo: e.logo ? `/logos/${e.logo}.png` : undefined,
    }));
}

export function formatValue(r: Pick<Ranking, "prefix" | "suffix" | "decimals">, v: number): string {
  return (
    r.prefix +
    v.toLocaleString("en-US", { minimumFractionDigits: r.decimals, maximumFractionDigits: r.decimals }) +
    r.suffix
  );
}

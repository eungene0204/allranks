import type { Ranking } from "./types";

// Which visualization a ranking page leads with. The choice follows what the numbers *are* (see .claude/skills/ranking-viz):
//   map       a rate / share / level where neighbours matter  → choropleth
//   treemap   an additive total (USD, tonnes, people…)         → area = share of the whole
//   strip     a per-capita figure, score or other level        → every entry on one number line, by world region
//   diverging values that go below zero                        → bars on both sides of zero
//   bubbles   a list of things that each sit in a country      → bubble per country, sized by entries
//   lollipop  a short list of records                          → dot-and-stem leaderboard
export type VizKind = "map" | "treemap" | "strip" | "diverging" | "bubbles" | "lollipop";

export const VIZ_KINDS: VizKind[] = ["map", "treemap", "strip", "diverging", "bubbles", "lollipop"];

/** Hand-picked exceptions to the rules below (ranking id → kind). Prefer fixing the rule if several rankings need the same exception. */
export const VIZ_OVERRIDES: Record<string, VizKind> = {};

// "per day" / "per year" only name the period of a total (barrels per day, TWh per year); any other "per" makes it a ratio.
const stripPeriod = (unit: string) => unit.replace(/\bper (day|year|month)\b/gi, "");
const RATIO = /%|\bper\b|\brate\b|\bindex\b|score|years|Mbps|µg|Gini|Rank|\bUSD$|\bUSD \(|\baged\b/i;
const TOTAL = /billion|trillion|million|thousand|tonnes|TWh|megawatts|chips|papers|models|clusters|systems|centers|companies|people|km²|carats|vehicles|barrels|m³|laureates|billionaires|robots/i;

export const isAdditive = (r: Pick<Ranking, "unit">) => {
  const u = stripPeriod(r.unit);
  return TOTAL.test(u) && !RATIO.test(u);
};

/** The visualization to show for this ranking, or null when the list is too short to draw anything useful. */
export function pickViz(r: Ranking): VizKind | null {
  const o = VIZ_OVERRIDES[r.id];
  if (o) return o;
  const n = r.items.length;
  if (n < 5) return null;
  if (r.items.some((i) => i.value < 0)) return n >= 10 ? "diverging" : null;
  if (r.scope) return n >= 8 ? (isAdditive(r) ? "treemap" : "strip") : "lollipop";
  if (r.multi) return "bubbles";
  if (n < 15) return "lollipop";
  if (isAdditive(r)) return "treemap";
  // Percent-of-something and rate figures read best as a map; per-person figures, scores and index levels as a distribution.
  return /%|rate|aged/i.test(stripPeriod(r.unit)) && !/\bper\b.*\bpeople\b/i.test(r.unit) ? "map" : "strip";
}

export const VIZ_LABEL: Record<VizKind, string> = {
  map: "Map",
  treemap: "Share of the total",
  strip: "Distribution",
  diverging: "Above and below zero",
  bubbles: "Where the entries are",
  lollipop: "Leaders",
};

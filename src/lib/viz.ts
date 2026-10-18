import type { Ranking } from "./types";

// Which visualization a ranking page leads with. The choice follows what the numbers *are* (see .claude/skills/ranking-viz):
//   map        a share or rate where neighbours matter                 → choropleth
//   treemap    an additive money total across many entries             → area = share of the whole
//   regions    an additive physical total across many entries          → one stacked bar split by world region
//   packed     an additive total across a medium-sized list            → circles packed by area
//   waffle     an additive total held by a handful of entries          → 100 squares, one per percent of the total
//   strip      a per-person figure, score or level                     → every entry on one number line, by world region
//   histogram  a rate per 1,000 / 100,000 people                       → how many entries fall in each band
//   scatter    a figure that relates to another ranking (VIZ_PAIRS)    → one dot per country on two axes
//   diverging  values that go below zero                               → bars on both sides of zero
//   bubbles    a list of things that each sit in a country             → bubble per country, sized by entries
//   podium     a short list led by a clear winner                      → three big cards
//   radial     a short list without a runaway leader                   → radial leaderboard
export type VizKind =
  | "map" | "treemap" | "regions" | "packed" | "waffle" | "strip" | "histogram" | "dots"
  | "scatter" | "diverging" | "bubbles" | "podium" | "radial";

export const VIZ_KINDS: VizKind[] = [
  "map", "treemap", "regions", "packed", "waffle", "strip", "histogram", "dots", "scatter", "diverging", "bubbles", "podium", "radial",
];

/** Hand-picked exceptions to the rules below (ranking id → kind). Prefer fixing the rule if several rankings need the same exception. */
export const VIZ_OVERRIDES: Record<string, VizKind> = {
  // A log-scale dot distribution complements the ranked bars in the table below.
  "us-highest-paid-ceos": "dots",
  // A few Gulf states (Qatar 83 t vs. median 2.6 t, min 0) squash a strip into the left edge; quintile shading on a map holds up.
  "co2-per-capita": "map",
  // National registrations omit some objects and count joint missions in each country, so a summed world-share chart is misleading.
  "space-objects-launched-annual": "map",
};

/**
 * Rankings drawn against another ranking: id → the id whose values go on the x axis. Opt-in and empty on purpose: a ranking page
 * should picture its own figures, and a second measure on the axis (e.g. GDP under internet use) reads as off-topic.
 */
export const VIZ_PAIRS: Record<string, string> = {};


/** What each scatter axis measures, as a plain noun phrase: the ranking titles are headlines ("Richest Countries by…"), not axis labels. */
export const AXIS_NAMES: Record<string, string> = {
  "life-expectancy": "Life expectancy",
  "internet-users": "Internet users",
  "co2-per-capita": "CO₂ emissions per person",
  "fertility-rate": "Fertility rate",
  "electricity-per-capita": "Electricity use per person",
  "energy-use-per-capita": "Energy use per person",
  "air-pollution": "Air pollution (PM2.5)",
  "urban-population": "Urban population",
  "generative-ai-users": "Generative AI users",
  "ai-publications-per-capita": "AI papers per person",
  "older-population": "Population aged 65+",
  "researchers-per-million": "Researchers per million people",
  "gdp-per-capita-ppp": "GDP per capita (PPP)",
  "gdp-per-capita": "GDP per capita",
  "rd-spending": "R&D spending",
};

// "per day" / "per year" only name the period of a total (barrels per day, TWh per year); any other "per" makes it a ratio.
const stripPeriod = (unit: string) => unit.replace(/\bper (day|year|month)\b/gi, "");
const RATIO = /%|\bper\b|\brate\b|\bindex\b|score|years|Mbps|µg|Gini|Rank|\bUSD$|\bUSD \(|\baged\b/i;
const TOTAL = /billion|trillion|million|thousand|tonnes|TWh|megawatts|chips|papers|models|clusters|systems|centers|companies|people|km²|carats|vehicles|barrels|m³|laureates|billionaires|robots/i;
const MONEY = /USD|EUR|GBP|CHF|JPY|CAD|AUD|\$|€|£/;
const PER_THOUSAND = /\bper (1,000|100,000|million)\b|\bper woman\b/i;

export const isAdditive = (r: Pick<Ranking, "unit">) => {
  const u = stripPeriod(r.unit);
  return TOTAL.test(u) && !RATIO.test(u);
};

/** Share of the whole list held by its three largest entries (0–1); only meaningful for additive, non-negative values. */
export function topShare(r: Pick<Ranking, "items">, n = 3): number {
  const vs = r.items.map((i) => i.value).filter((v) => v > 0).sort((a, b) => b - a);
  const total = vs.reduce((s, v) => s + v, 0);
  return total > 0 ? vs.slice(0, n).reduce((s, v) => s + v, 0) / total : 0;
}

/** The visualization to show for this ranking, or null when the list is too short to draw anything useful. */
export function pickViz(r: Ranking): VizKind | null {
  const o = VIZ_OVERRIDES[r.id];
  if (o) return o;
  const n = r.items.length;
  if (n < 5) return null;
  if (VIZ_PAIRS[r.id] && !r.scope && !r.multi) return "scatter";
  if (r.items.some((i) => i.value < 0)) return n >= 10 ? "diverging" : null;
  const additive = isAdditive(r);
  if (r.scope) {
    if (n < 8) return null;
    if (!additive) return "strip";
    return n < 25 ? "packed" : "treemap";
  }
  if (r.multi) return "bubbles";
  if (n < 15) {
    const [a, b] = [...r.items].map((i) => i.value).sort((p, q) => (r.order === "asc" ? p - q : q - p));
    // A clear winner (at least 1.5× the runner-up, on a real quantity) deserves the big-number treatment.
    if (r.unit !== "Rank" && a > 0 && b > 0 && a / b >= 1.5) return "podium";
    return "radial";
  }
  // Discrete or highly concentrated country indicators pile up on a strip's few x
  // positions, making tall swarms instead of a useful distribution. Their country
  // pattern reads better on a map (regional lists keep their local distribution above).
  const frequencies = new Map<number, number>();
  for (const item of r.items) frequencies.set(item.value, (frequencies.get(item.value) ?? 0) + 1);
  const distinctValues = frequencies.size;
  const largestPile = Math.max(...frequencies.values()) / n;
  if (distinctValues <= 8 || largestPile >= 0.3) return "map";
  if (additive) {
    if (topShare(r) >= 0.65) return "waffle";
    if (n < 30) return "packed";
    return MONEY.test(r.unit) ? "treemap" : "regions";
  }
  const u = stripPeriod(r.unit);
  if (PER_THOUSAND.test(u)) return "histogram";
  // Percent-of-something and rate figures read best as a map; per-person figures, scores and index levels as a distribution.
  return /%|rate|aged/i.test(u) && !/\bper\b.*\bpeople\b/i.test(r.unit) ? "map" : "strip";
}

export const VIZ_LABEL: Record<VizKind, string> = {
  map: "Map",
  treemap: "Share of the total",
  regions: "By world region",
  packed: "Bubble chart",
  waffle: "Who holds the total",
  strip: "Distribution",
  histogram: "Histogram",
  dots: "Log-scale dot distribution",
  scatter: "Compared with another ranking",
  diverging: "Above and below zero",
  bubbles: "Where the entries are",
  podium: "Top three",
  radial: "Radial leaderboard",
};

import { formatValue } from "./format.ts";
import type { Ranking } from "./types";

// Editorial pool: these directions have an interpretable strength. Never infer
// desirability from order alone (e.g. high unemployment is not a strength).
const TOPICS = new Set([
  "customs-export-time", "customs-import-time", "agriculture-worker-productivity",
  "industry-worker-productivity", "business-ready-finance", "business-ready-labor",
  "business-ready-public-services", "business-ready-tax", "business-ready-trade",
  "business-ready-utilities", "firms-filing-taxes-online", "ict-service-export-share",
  "internet-speed-fixed", "internet-speed-mobile", "global-innovation-index",
  "innovation-creative-outputs", "innovation-human-capital-research",
  "innovation-infrastructure", "innovation-institutions", "innovation-knowledge-technology",
  "innovation-market-sophistication", "innovation-business-sophistication",
  "human-capital-education", "human-capital-health", "math-scores",
  "electricity-solar-share", "electricity-wind-share", "ev-market-share",
  "renewable-electricity", "women-in-management", "protected-land", "marine-protection",
]);

export type CountryDiscovery = {
  id: string; title: string; category: string; icon: string;
  rank: number; total: number; topPercent: number; tied: boolean;
  value: string; unit: string; period: string;
  sourceName: string; sourceUrl: string; verification: string;
};

/** Stable, diverse picks from comparable country-level data, not a country score. */
export function countryDiscoveries(rankings: Ranking[], code: string, year = new Date().getUTCFullYear()): CountryDiscovery[] {
  const candidates: (CountryDiscovery & { positionShare: number })[] = [];
  for (const r of rankings) {
    if (!TOPICS.has(r.id) || r.scope || r.multi || !r.source.url || r.items.length < 30) continue;
    if (r.year < year - 5 || r.year > year || r.source.verified === false) continue;
    if ((r.source.kind === "manual" || r.source.kind === "agent") && r.source.verified !== true) continue;
    if (new Set(r.items.map((item) => item.country)).size !== r.items.length) continue;
    if (r.items.some((item) => !Number.isFinite(item.value))) continue;
    const entry = r.items.find((item) => item.country === code);
    if (!entry || r.items.every((item) => item.value === entry.value)) continue;
    // Competition ranks keep alphabetical tie-breaking out of discovery claims.
    const rank = 1 + r.items.filter((item) => r.order === "asc" ? item.value < entry.value : item.value > entry.value).length;
    const tieSize = r.items.filter((item) => item.value === entry.value).length;
    // Include every tied entry when describing a percentile: a large tied group
    // must not become a misleading "top 1%" claim just because its rank is #1.
    const positionShare = (rank - 1 + tieSize) / r.items.length;
    if (positionShare > 0.2) continue;
    candidates.push({
      id: r.id, title: r.title, category: r.category, icon: r.icon,
      rank, total: r.items.length, topPercent: Math.ceil(positionShare * 100),
      tied: tieSize > 1, positionShare,
      value: formatValue(r, entry.value), unit: r.unit, period: r.asOf ?? String(r.year),
      sourceName: r.source.name, sourceUrl: r.source.url,
      verification: r.source.verified === true ? "Human-checked" : "Automatic source · human check not recorded",
    });
  }
  candidates.sort((a, b) => a.positionShare - b.positionShare || b.period.localeCompare(a.period) || a.id.localeCompare(b.id));
  const categories = new Set<string>();
  return candidates.filter((item) => {
    if (categories.has(item.category)) return false;
    categories.add(item.category);
    return true;
  }).slice(0, 3).map(({ positionShare: _, ...discovery }) => discovery);
}

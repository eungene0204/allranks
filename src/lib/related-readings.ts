import type { Ranking } from "./types";
import { editorialProfile } from "./editorial-profiles.ts";
import { guideForRanking } from "./reading-guides.ts";

/** Same-country measures first; global indicators match the population and topic, not just the category. */
export function relatedReadings(r: Ranking, rankings: Ranking[]): Ranking[] {
  const guide = guideForRanking(r);
  const terms = new Set(`${r.title} ${r.short ?? ""}`.toLowerCase().match(/[a-z]{4,}/g)?.filter((term) => !["countries", "country", "total", "population", "world", "current", "constant", "value", "share"].includes(term)) ?? []);
  const profile = editorialProfile(r).id;
  return rankings.filter((other) => other.id !== r.id && (r.scope
    ? other.scope === r.scope && other.source.url === r.source.url
    : !other.scope && other.category === r.category && (guide?.rankingIds.includes(other.id) || editorialProfile(other).id === profile)))
    .map((other) => ({ ranking: other, score: (guide?.rankingIds.includes(other.id) ? 20 : 0) + (other.year === r.year ? 3 : 0) + [...terms].filter((term) => other.title.toLowerCase().includes(term)).length * 4 }))
    .filter((candidate) => r.scope || candidate.score >= 7)
    .sort((a, b) => b.score - a.score || a.ranking.title.localeCompare(b.ranking.title))
    .slice(0, 4).map((candidate) => candidate.ranking);
}

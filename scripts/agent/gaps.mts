// Deterministic gap analysis: what do we have, what is missing, what is old? No LLM involved —
// the agent gets this as its starting point so it does not have to discover the catalogue by itself.
import { CATEGORIES } from "../../src/lib/categories.ts";
import type { RankingFile } from "../lib/types.mts";

const DAY = 864e5;
export const ageDays = (r: RankingFile, now = Date.now()) => Math.max(0, Math.floor((now - Date.parse(r.updatedAt)) / DAY));

/** Rankings the agent may re-research: hand-entered or agent-collected. API/Wikipedia ones belong to `npm run data:update`. */
export const refreshable = (r: RankingFile) => r.source.kind === "manual" || r.source.kind === "agent";

export type Coverage = {
  total: number;
  world: number;
  scoped: number;
  categories: { id: string; name: string; blurb: string; world: number; scoped: number }[];
  emptyCategories: string[];
  scopes: { country: string; rankings: number }[];
  stale: { id: string; kind: string; ageDays: number; year: number; verified: boolean }[];
};

export function coverage(all: RankingFile[], staleDays: number, now = Date.now()): Coverage {
  const categories = CATEGORIES.map((c) => {
    const inCat = all.filter((r) => r.category === c.id);
    return { id: c.id, name: c.name, blurb: c.blurb, world: inCat.filter((r) => !r.scope).length, scoped: inCat.filter((r) => r.scope).length };
  });
  const byScope = new Map<string, number>();
  for (const r of all) if (r.scope) byScope.set(r.scope, (byScope.get(r.scope) ?? 0) + 1);
  return {
    total: all.length,
    world: all.filter((r) => !r.scope).length,
    scoped: all.filter((r) => r.scope).length,
    categories,
    emptyCategories: categories.filter((c) => c.world === 0).map((c) => c.id),
    scopes: [...byScope].map(([country, rankings]) => ({ country, rankings })).sort((a, b) => b.rankings - a.rankings),
    stale: all
      // Hand-entered sample data is always due: it was never checked against a source.
      .filter((r) => refreshable(r) && (ageDays(r, now) >= staleDays || (r.source.kind === "manual" && r.source.verified !== true)))
      .map((r) => ({ id: r.id, kind: r.source.kind, ageDays: ageDays(r, now), year: r.year, verified: r.source.verified === true }))
      .sort((a, b) => b.ageDays - a.ageDays),
  };
}

/** Compact text for the prompt. */
export function renderCoverage(c: Coverage, all: RankingFile[]): string {
  const lines = [
    `Catalogue: ${c.total} rankings (${c.world} world-wide, ${c.scoped} inside one country).`,
    "",
    "Categories (world rankings / country-internal rankings):",
    ...c.categories.map((x) => `- ${x.id}: ${x.world} / ${x.scoped}${x.world === 0 ? "  <-- EMPTY" : ""}  (${x.blurb})`),
    "",
    `Countries that have country-internal rankings: ${c.scopes.map((s) => `${s.country}(${s.rankings})`).join(" ")}`,
    "",
    "Existing world rankings (id — title — category — source kind — data year):",
    ...all.filter((r) => !r.scope).map((r) => `- ${r.id} — ${r.title} — ${r.category} — ${r.source.kind} — ${r.year}`),
    "",
    "Existing country-internal rankings are named <cc>-<topic> (scope = ISO-2 country). Use list_rankings to see them.",
  ];
  return lines.join("\n");
}

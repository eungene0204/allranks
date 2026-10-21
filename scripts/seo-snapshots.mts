import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import type { Ranking } from "../src/lib/types.ts";

// Track observed public content changes, not repeated fetches or the build clock.
// The initial entry records when this snapshot first entered the SEO manifest.
const manifestPath = "data/seo-snapshots.json";
type Snapshot = { hash: string; lastModified: string };
const previous: Record<string, Snapshot> = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const next: Record<string, Snapshot> = {};
const observedAt = new Date().toISOString();
for (const file of readdirSync("data/rankings").filter((name) => name.endsWith(".json")).sort()) {
  const ranking: Ranking = JSON.parse(readFileSync(`data/rankings/${file}`, "utf8"));
  if (ranking.source.verified === false || (["manual", "agent"].includes(ranking.source.kind) && ranking.source.verified !== true)) continue;
  // A timestamp-only fetch does not mean that the ranking content has changed.
  const { updatedAt: _fetchedAt, ...content } = ranking;
  const hash = createHash("sha256").update(JSON.stringify(content)).digest("hex");
  next[ranking.id] = previous[ranking.id]?.hash === hash ? previous[ranking.id] : { hash, lastModified: observedAt };
}
const serialized = `${JSON.stringify(next, null, 2)}\n`;
if (!existsSync(manifestPath) || readFileSync(manifestPath, "utf8") !== serialized) writeFileSync(manifestPath, serialized);
console.log(`SEO snapshots: ${Object.keys(next).length} public rankings`);

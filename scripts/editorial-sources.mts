/** Refresh publisher definitions without changing ranking observations or verification flags. */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import type { Ranking } from "../src/lib/types.ts";
import type { PublisherDefinition } from "../src/lib/ranking-article.ts";

const publicRankings = readdirSync("data/rankings").filter((file) => file.endsWith(".json")).map((file) => JSON.parse(readFileSync(`data/rankings/${file}`, "utf8")) as Ranking)
  .filter((r) => r.source.verified !== false && (!["manual", "agent"].includes(r.source.kind) || r.source.verified === true));
const codes = new Set(publicRankings.flatMap((r) => r.source.url?.includes("data.worldbank.org/indicator/") ? [decodeURIComponent(r.source.url.split("/indicator/")[1].split(/[?#]/)[0])] : []));
const catalogUrl = "https://api.worldbank.org/v2/indicator?format=json&per_page=30000";
const response = await fetch(catalogUrl, { signal: AbortSignal.timeout(60_000) });
if (!response.ok) throw new Error(`Publisher metadata returned HTTP ${response.status}`);
const [pagination, records] = await response.json() as [{ pages: number }, { id: string; name: string; sourceNote?: string; sourceOrganization?: string; topics?: { value: string }[] }[]];
if (pagination.pages !== 1) throw new Error("Publisher metadata is paginated; refusing to save an incomplete catalog.");
const indicators: Record<string, PublisherDefinition> = Object.fromEntries(records.filter((record) => codes.has(record.id)).map((record) => [record.id, {
  name: record.name, definition: record.sourceNote ?? "", organization: record.sourceOrganization ?? "", topics: record.topics?.map((topic) => topic.value) ?? [],
}]));
const missing = [...codes].filter((code) => !indicators[code]);
if (missing.length) throw new Error(`Missing publisher indicator records: ${missing.join(", ")}`);
writeFileSync("data/editorial/worldbank-definitions.json", JSON.stringify({ retrievedAt: new Date().toISOString(), catalogUrl, indicators }, null, 2) + "\n");
console.log(`Saved ${Object.keys(indicators).length} publisher definitions. Observation values and verified flags are unchanged.`);

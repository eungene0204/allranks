// Usage:  node scripts/update.mts [ranking-id ...] [--dry] [--jobs N]
//   no ids → every pipeline in registry.mts;  --dry → fetch and report, write nothing;  --jobs → pipelines fetched in parallel (default 3).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { loadCountries } from "./lib/countries.mts";
import { PIPELINES } from "./registry.mts";
import type { Item, RankingFile } from "./lib/types.mts";
import type { Fetched } from "./lib/types.mts";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const jobsAt = args.indexOf("--jobs");
const jobs = jobsAt >= 0 ? Math.max(1, Number(args[jobsAt + 1]) || 3) : 3;
const ids = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--jobs");
const unknown = ids.filter((id) => !PIPELINES.some((p) => p.meta.id === id));
if (unknown.length) {
  console.error(`Unknown ranking id(s): ${unknown.join(", ")}\nAvailable: ${PIPELINES.map((p) => p.meta.id).join(", ")}`);
  process.exit(2);
}

const ctx = { countries: loadCountries() };
const fileFor = (id: string) => new URL(`../data/rankings/${id}.json`, import.meta.url);
const sortItems = (items: Item[], order: "asc" | "desc") =>
  [...items].sort((a, b) => (order === "asc" ? a.value - b.value : b.value - a.value) || a.name.localeCompare(b.name));

let failed = 0;
async function run(p: (typeof PIPELINES)[number]) {
  const { id } = p.meta;
  const prev: RankingFile | undefined = existsSync(fileFor(id)) ? JSON.parse(readFileSync(fileFor(id), "utf8")) : undefined;
  const minYear = p.minYear ?? 2025;
  try {
    // Query every registered provider. The newest eligible response wins; provider order breaks ties.
    const attempts = await Promise.allSettled([p.fetch, ...(p.fallbacks ?? [])].map((fetcher) => fetcher(ctx)));
    const available = attempts.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
    const effectiveYear = (got: Fetched) => Number((got.asOf ?? String(got.year)).slice(0, 4)) || got.year;
    const eligible = available.filter((got) => effectiveYear(got) >= minYear);
    if (!eligible.length) {
      const failedSources = attempts.filter((r) => r.status === "rejected").length;
      console.log(`= ${id.padEnd(22)} ${prev ? `retained ${prev.asOf ?? prev.year} historical snapshot` : "no eligible snapshot"} · no data from ${minYear} or later${failedSources ? ` · ${failedSources}/${attempts.length} sources unavailable` : ""}`);
      return;
    }
    const got = eligible.reduce((latest, current) => effectiveYear(current) > effectiveYear(latest) ? current : latest);
    if (prev && effectiveYear(got) < Number((prev.asOf ?? String(prev.year)).slice(0, 4))) {
      console.log(`= ${id.padEnd(22)} retained newer ${prev.asOf ?? prev.year} snapshot`);
      return;
    }

    // Guards: refuse data that looks broken rather than overwrite good data with it.
    const bad = got.items.filter((i) => !Number.isFinite(i.value));
    if (bad.length) throw new Error(`${bad.length} non-numeric value(s), e.g. ${bad[0].name}`);
    // One row per country — or, for a regional ranking (`scope`), one row per region name.
    const seen = new Set<string>();
    for (const i of got.items) {
      if (!i.country) throw new Error(`${i.name}: automated country ranking is missing a country code`);
      const byName = p.meta.scope || p.meta.multi;
      const key = byName ? i.name : i.country;
      if (seen.has(key)) throw new Error(`duplicate ${byName ? "entry" : "country"} ${key}`);
      seen.add(key);
      if (p.meta.scope && i.country !== p.meta.scope) throw new Error(`${i.name}: country must be ${p.meta.scope}`);
    }
    const minItems = p.minItems ?? (p.meta.scope ? 5 : 10);
    if (got.items.length < minItems) throw new Error(`only ${got.items.length} items (< ${minItems}) — source layout probably changed`);

    // A newer data year may be thinner than the older one (latest data has priority), so only same-year drops are suspicious.
    if (prev && got.year <= prev.year && got.items.length < prev.items.length * 0.7)
      throw new Error(`item count dropped ${prev.items.length} → ${got.items.length} (>30%); keeping the old file`);

    const next: RankingFile = {
      ...p.meta,
      year: got.year,
      ...(got.asOf ? { asOf: got.asOf } : {}),
      source: got.source,
      updatedAt: new Date().toISOString(),
      // Keep two more decimals than we display; raw API floats like 1463.865525 are just noise on disk.
      items: sortItems(got.items, p.meta.order).map((i) => ({ ...i, value: Number(i.value.toFixed(p.meta.decimals + 2)) })),
    };
    // Only touch the file when the data changed, so re-runs leave no noise in diffs.
    const strip = (r?: RankingFile) => JSON.stringify(r && { ...r, updatedAt: "" });
    const changed = strip(prev) !== strip(next);
    if (changed && !dry) writeFileSync(fileFor(id), JSON.stringify(next, null, 2) + "\n");

    const top = next.items[0];
    console.log(
      `${changed ? (dry ? "~" : "✓") : "="} ${id.padEnd(22)} ${String(next.items.length).padStart(3)} items · ${next.asOf ?? next.year} · #1 ${top.name} (${top.value})${changed ? "" : "  (unchanged)"}`,
    );
  } catch (err) {
    failed++;
    console.error(`✗ ${id.padEnd(22)} ${(err as Error).message}`);
  }
}
// Small worker pool: each pipeline only reads its own source and writes its own file, so they can overlap.
const queue = PIPELINES.filter((p) => !ids.length || ids.includes(p.meta.id));
await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, async () => { for (let p; (p = queue.shift()); ) await run(p); }));
if (failed) {
  console.error(`\n${failed} ranking(s) failed validation; their existing files were left untouched.`);
  process.exit(1);
}

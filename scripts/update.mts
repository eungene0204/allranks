// Usage:  node scripts/update.mts [ranking-id ...] [--dry]
//   no ids → every pipeline in registry.mts;  --dry → fetch and report, write nothing.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { loadCountries } from "./lib/countries.mts";
import { PIPELINES } from "./registry.mts";
import type { Item, RankingFile } from "./lib/types.mts";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const ids = args.filter((a) => !a.startsWith("--"));
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
for (const p of PIPELINES.filter((p) => !ids.length || ids.includes(p.meta.id))) {
  const { id } = p.meta;
  try {
    const got = await p.fetch(ctx);

    // Guards: refuse data that looks broken rather than overwrite good data with it.
    const bad = got.items.filter((i) => !Number.isFinite(i.value));
    if (bad.length) throw new Error(`${bad.length} non-numeric value(s), e.g. ${bad[0].name}`);
    // One row per country — or, for a regional ranking (`scope`), one row per region name.
    const seen = new Set<string>();
    for (const i of got.items) {
      const byName = p.meta.scope || p.meta.multi;
      const key = byName ? i.name : i.country;
      if (seen.has(key)) throw new Error(`duplicate ${byName ? "entry" : "country"} ${key}`);
      seen.add(key);
      if (p.meta.scope && i.country !== p.meta.scope) throw new Error(`${i.name}: country must be ${p.meta.scope}`);
    }
    const minItems = p.minItems ?? (p.meta.scope ? 5 : 20);
    if (got.items.length < minItems) throw new Error(`only ${got.items.length} items (< ${minItems}) — source layout probably changed`);

    const prev: RankingFile | undefined = existsSync(fileFor(id)) ? JSON.parse(readFileSync(fileFor(id), "utf8")) : undefined;
    if (prev && got.items.length < prev.items.length * 0.7)
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
if (failed) {
  console.error(`\n${failed} ranking(s) failed; their existing files were left untouched.`);
  process.exit(1);
}

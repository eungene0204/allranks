// Usage:  node scripts/freshness.mts [--max-age N] [--all]
//   Lists rankings whose data year is more than N years behind today (default 1: in 2026, anything ≤ 2024).
//   Reads only data/rankings/*.json — no network. Run it after `npm run data:update` to see what the pipelines
//   could NOT bring up to date, i.e. what needs a new source or a human/agent look.
import { readdirSync, readFileSync } from "node:fs";
import type { RankingFile } from "./lib/types.mts";

const args = process.argv.slice(2);
const maxAge = args.includes("--max-age") ? Number(args[args.indexOf("--max-age") + 1]) : 1;
const thisYear = new Date().getFullYear();
const dir = new URL("../data/rankings/", import.meta.url);

const rows = readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(new URL(f, dir), "utf8")) as RankingFile)
  .map((r) => ({ id: r.id, kind: r.source.kind, year: r.year, asOf: r.asOf, source: r.source.name, verified: r.source.verified, n: r.items.length }))
  .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));

const stale = rows.filter((r) => thisYear - r.year > maxAge);
const hand = rows.filter((r) => r.kind === "manual" || r.kind === "agent");

console.log(`${rows.length} rankings · data year histogram:`);
const hist = new Map<number, number>();
for (const r of rows) hist.set(r.year, (hist.get(r.year) ?? 0) + 1);
for (const [y, n] of [...hist].sort()) console.log(`  ${y}  ${"█".repeat(Math.ceil(n / 4))} ${n}`);

console.log(`\nStale (data year ≤ ${thisYear - maxAge - 1}): ${stale.length}`);
const bySource = new Map<string, typeof stale>();
for (const r of stale) bySource.set(r.source, [...(bySource.get(r.source) ?? []), r]);
for (const [src, list] of [...bySource].sort((a, b) => b[1].length - a[1].length))
  console.log(`- ${src.slice(0, 90)} — ${list.length}: ${list.slice(0, 6).map((r) => `${r.id}(${r.year})`).join(", ")}${list.length > 6 ? ", …" : ""}`);

console.log(`\nHand-entered / agent-collected (the pipelines never refresh these): ${hand.length}`);
for (const r of hand) console.log(`- ${r.id} · ${r.kind}${r.verified ? " · verified" : ""} · ${r.year} · ${r.source.slice(0, 70)}`);

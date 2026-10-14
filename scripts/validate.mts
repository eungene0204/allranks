// Usage: node scripts/validate.mts   — exits non-zero if any data/rankings/*.json is malformed.
import { readdirSync, readFileSync } from "node:fs";
import { loadCountries } from "./lib/countries.mts";
import { checkRanking } from "./lib/check.mts";
import { CATEGORIES } from "../src/lib/categories.ts";
import type { RankingFile } from "./lib/types.mts";

const dir = new URL("../data/rankings/", import.meta.url);
const countries = loadCountries();
const categoryIds = new Set(CATEGORIES.map((c) => c.id));
const STALE_DAYS = 120;

let errors = 0;
let warnings = 0;
const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
const seenIds = new Set<string>();

for (const f of files) {
  const problems: string[] = [];
  const warns: string[] = [];
  const need = (cond: boolean, msg: string) => cond || problems.push(msg);
  let r: RankingFile;
  try {
    r = JSON.parse(readFileSync(new URL(f, dir), "utf8"));
  } catch (e) {
    console.error(`✗ ${f}: invalid JSON (${(e as Error).message})`);
    errors++;
    continue;
  }
  problems.push(...checkRanking(r, { countries, categoryIds }, f.replace(/\.json$/, "")));
  need(!seenIds.has(r.id), "duplicate id");
  seenIds.add(r.id);

  const ageDays = (Date.now() - Date.parse(r.updatedAt)) / 864e5;
  if (!Number.isFinite(ageDays)) problems.push("updatedAt is not a date");
  else if (r.source?.kind !== "manual" && ageDays > STALE_DAYS) warns.push(`data is ${Math.round(ageDays)} days old — run \`${r.source?.kind === "agent" ? "npm run agent -- refresh" : "npm run data:update"}\``);
  if ((r.source?.kind === "manual" || r.source?.kind === "agent") && r.source.verified === false) warns.push(`${r.source.kind} data not yet verified`);

  if (problems.length) {
    errors += problems.length;
    console.error(`✗ ${f}\n${problems.map((p) => `    - ${p}`).join("\n")}`);
  } else {
    console.log(`✓ ${f.padEnd(30)} ${String(r.items.length).padStart(3)} items · ${r.source.kind}`);
  }
  for (const w of warns) { warnings++; console.warn(`  ⚠ ${f}: ${w}`); }
}
console.log(`\n${files.length} files, ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);

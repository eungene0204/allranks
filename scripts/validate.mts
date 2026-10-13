// Usage: node scripts/validate.mts   — exits non-zero if any data/rankings/*.json is malformed.
import { readdirSync, readFileSync } from "node:fs";
import { loadCountries } from "./lib/countries.mts";
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
  let r: RankingFile;
  try {
    r = JSON.parse(readFileSync(new URL(f, dir), "utf8"));
  } catch (e) {
    console.error(`✗ ${f}: invalid JSON (${(e as Error).message})`);
    errors++;
    continue;
  }
  const need = (cond: boolean, msg: string) => cond || problems.push(msg);

  need(r.id === f.replace(/\.json$/, ""), `id "${r.id}" must match the file name`);
  need(!seenIds.has(r.id), "duplicate id");
  seenIds.add(r.id);
  for (const k of ["title", "icon", "desc", "unit"] as const) need(typeof r[k] === "string" && r[k].length > 0, `missing ${k}`);
  for (const k of ["prefix", "suffix"] as const) need(typeof r[k] === "string", `${k} must be a string (may be empty)`);
  need(categoryIds.has(r.category), `unknown category "${r.category}"`);
  need(r.order === "asc" || r.order === "desc", `order must be asc|desc`);
  need(Number.isInteger(r.decimals) && r.decimals >= 0 && r.decimals <= 4, "decimals must be an integer 0–4");
  need(Number.isInteger(r.year) && r.year > 1990 && r.year <= new Date().getFullYear() + 1, `implausible year ${r.year}`);
  need(!!r.source?.name && ["api", "csv", "wikipedia", "manual"].includes(r.source.kind), "source needs a name and a valid kind");
  need(Array.isArray(r.items) && r.items.length >= 5, "needs at least 5 items");

  const names = new Set<string>();
  const codes = new Set<string>();
  for (const i of r.items ?? []) {
    need(typeof i.name === "string" && i.name.length > 0, "item without a name");
    need(Number.isFinite(i.value), `${i.name}: value is not a finite number`);
    need(countries.byCode2.has(i.country), `${i.name}: unknown country code "${i.country}"`);
    need(!names.has(i.name), `duplicate item name "${i.name}"`);
    names.add(i.name);
    codes.add(i.country);
  }
  // Rankings meant to be one-row-per-country (everything except lists of institutions/landmarks) must not repeat a country.
  if (r.scope) {
    need(countries.byCode2.has(r.scope), `unknown scope "${r.scope}"`);
    need(codes.size === 1 && codes.has(r.scope), `every item of a regional ranking must have country "${r.scope}"`);
  } else if (r.source?.kind !== "manual" && !r.multi) need(codes.size === r.items.length, "a country appears more than once");

  const ageDays = (Date.now() - Date.parse(r.updatedAt)) / 864e5;
  if (!Number.isFinite(ageDays)) problems.push("updatedAt is not a date");
  else if (r.source?.kind !== "manual" && ageDays > STALE_DAYS) warns.push(`data is ${Math.round(ageDays)} days old — run \`npm run data:update\``);
  if (r.source?.kind === "manual" && r.source.verified === false) warns.push("manual data not yet verified (sample values)");

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

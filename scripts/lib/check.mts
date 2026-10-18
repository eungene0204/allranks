// Structural checks for one ranking file. Shared by `npm run data:validate` and the data-collection agent,
// so the agent can never write a file that the build would later reject.
import type { CountryIndex, RankingFile } from "./types.mts";

export const SOURCE_KINDS = ["api", "csv", "wikipedia", "manual", "agent"];

export type CheckCtx = { countries: CountryIndex; categoryIds: Set<string> };

/** Returns the list of problems (empty = valid). `fileId` is the file name without `.json`, when known. */
export function checkRanking(r: RankingFile, { countries, categoryIds }: CheckCtx, fileId?: string): string[] {
  const problems: string[] = [];
  const need = (cond: boolean, msg: string) => cond || problems.push(msg);

  if (fileId !== undefined) need(r.id === fileId, `id "${r.id}" must match the file name`);
  for (const k of ["title", "icon", "desc", "unit"] as const) need(typeof r[k] === "string" && r[k].length > 0, `missing ${k}`);
  for (const k of ["prefix", "suffix"] as const) need(typeof r[k] === "string", `${k} must be a string (may be empty)`);
  need(categoryIds.has(r.category), `unknown category "${r.category}"`);
  need(r.order === "asc" || r.order === "desc", `order must be asc|desc`);
  need(Number.isInteger(r.decimals) && r.decimals >= 0 && r.decimals <= 4, "decimals must be an integer 0–4");
  need(Number.isInteger(r.year) && r.year > 1990 && r.year <= new Date().getFullYear() + 1, `implausible year ${r.year}`);
  need(!!r.source?.name && SOURCE_KINDS.includes(r.source.kind), "source needs a name and a valid kind");
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
  } else if (r.source?.kind !== "manual" && !r.multi) need(codes.size === (r.items ?? []).length, "a country appears more than once");

  return problems;
}

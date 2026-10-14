// The agent's hands. It can look at the catalogue and submit rankings, but every submission goes through the
// same checks as `npm run data:validate`, plus guards of its own — the model never writes files directly.
import { CATEGORIES } from "../../src/lib/categories.ts";
import { checkRanking } from "../lib/check.mts";
import { PIPELINES } from "../registry.mts";
import { ageDays } from "./gaps.mts";
import { rankingExists, readAllRankings, readNotes, readRanking, writeNotes, writeRanking } from "./store.mts";
import type { CountryIndex, Item, RankingFile, Source } from "../lib/types.mts";
import type { RunReport } from "./store.mts";

export type ToolDef = { name: string; description: string; input_schema: { type: "object"; properties: Record<string, unknown>; required: string[]; additionalProperties: false } };
export type ToolResult = { text: string; isError?: boolean };

export type Limits = { maxNew: number; maxUpdates: number };
const PIPELINE_IDS = new Set(PIPELINES.map((p) => p.meta.id));
const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));
/** Updates may not move one value by more than this factor unless the agent explicitly confirms it. */
const MAX_JUMP = 3;

const sourceSchema = {
  type: "object",
  description: "Where the numbers were read. `url` is the page you actually fetched; list any further pages in `urls`.",
  properties: {
    name: { type: "string", description: "Publisher, e.g. 'IEA World Energy Statistics'" },
    url: { type: "string", description: "https page the data was read from" },
    urls: { type: "array", items: { type: "string" } },
    license: { type: "string", description: "e.g. 'CC BY 4.0', 'CC BY-SA 4.0', 'Public domain'. Omit if unknown." },
    note: { type: "string", description: "One line on method/caveats (what exactly the number measures, any exclusions)." },
  },
  required: ["name", "url"],
  additionalProperties: false,
};
const itemsSchema = {
  type: "array",
  description: "One row per entry. `country` is ISO 3166-1 alpha-2. `value` is a plain number in the ranking's unit (not a string, no thousands separators).",
  items: {
    type: "object",
    properties: {
      name: { type: "string" },
      country: { type: "string", description: "ISO-2 code, e.g. 'DE'" },
      value: { type: "number" },
      detail: { type: "string", description: "Optional muted second line, e.g. the state a city is in" },
    },
    required: ["name", "country", "value"],
    additionalProperties: false,
  },
};

export const TOOL_DEFS: ToolDef[] = [
  {
    name: "list_rankings",
    description: "List existing rankings (id, title, category, scope, source kind, data year, age). Filter by category or by scope (an ISO-2 country code; use 'world' for world-wide only).",
    input_schema: { type: "object", properties: { category: { type: "string" }, scope: { type: "string" } }, required: [], additionalProperties: false },
  },
  {
    name: "read_ranking",
    description: "Read one existing ranking: its metadata and its rows (all rows if there are at most 60, otherwise the top 30 plus the count). Look at a similar ranking before creating a new one to match its units and style.",
    input_schema: { type: "object", properties: { id: { type: "string" }, all_rows: { type: "boolean", description: "Return every row even if there are more than 60" } }, required: ["id"], additionalProperties: false },
  },
  {
    name: "create_ranking",
    description:
      "Add a NEW ranking to the website. Fails with a list of problems if anything is invalid — fix them and call again. Only use numbers you read on a page during this run.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "kebab-case, unique, e.g. 'electricity-generation'. Country-internal rankings start with the lower-case ISO-2 code, e.g. 'de-state-gdp'." },
        title: { type: "string", description: "Headline in the site's style, e.g. 'Largest Electricity Producers'" },
        short: { type: "string", description: "Short tab label, only for country-internal rankings" },
        category: { type: "string", enum: [...CATEGORY_IDS] },
        icon: { type: "string", description: "One emoji" },
        desc: { type: "string", description: "One or two plain sentences saying what is measured" },
        unit: { type: "string", description: "e.g. 'TWh per year'" },
        prefix: { type: "string", description: "Shown before the number, e.g. '$' (may be empty)" },
        suffix: { type: "string", description: "Shown after the number, e.g. ' TWh' (may be empty)" },
        decimals: { type: "integer", minimum: 0, maximum: 4 },
        order: { type: "string", enum: ["asc", "desc"], description: "'desc': highest value is #1" },
        scope: { type: "string", description: "ISO-2 code, ONLY for a ranking of regions/cities/institutions inside one country; every item then has this country" },
        multi: { type: "boolean", description: "True if one country may appear several times (cities, companies…)" },
        year: { type: "integer", description: "Year the DATA refers to (not today's year)" },
        asOf: { type: "string", description: "Optional finer period, 'YYYY-MM'" },
        source: sourceSchema,
        items: itemsSchema,
      },
      required: ["id", "title", "category", "icon", "desc", "unit", "prefix", "suffix", "decimals", "order", "year", "source", "items"],
      additionalProperties: false,
    },
  },
  {
    name: "update_ranking",
    description:
      "Replace the data of an EXISTING hand-entered or agent-collected ranking with newer figures (rankings fed by the automatic pipelines are off-limits). Metadata stays as it is. Send the complete new row list, not a diff. Rejected if the data is not newer, loses more than 30% of the rows, or moves a value more than 3x without confirm_large_changes.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        year: { type: "integer" },
        asOf: { type: "string" },
        source: sourceSchema,
        items: itemsSchema,
        change_summary: { type: "string", description: "One line: what changed and why (e.g. 'new 2025 edition; 12 rows moved')" },
        confirm_large_changes: { type: "boolean", description: "Set to true only after re-checking the source for values that moved more than 3x" },
      },
      required: ["id", "year", "source", "items", "change_summary"],
      additionalProperties: false,
    },
  },
  {
    name: "record_finding",
    description:
      "Remember something for future runs: a topic you rejected (no reliable free source, licence problem, too few countries…) so nobody retries it, or a promising candidate you did not have time for.",
    input_schema: {
      type: "object",
      properties: { topic: { type: "string" }, status: { type: "string", enum: ["rejected", "candidate"] }, reason: { type: "string" } },
      required: ["topic", "status", "reason"],
      additionalProperties: false,
    },
  },
];

type Obj = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");

export class Toolbox {
  created: RunReport["created"] = [];
  updated: RunReport["updated"] = [];
  rejected: RunReport["rejected"] = [];
  private ctx: { countries: CountryIndex };
  private limits: Limits;
  private dry: boolean;
  // No parameter properties: node strips types natively and does not support that syntax.
  constructor(ctx: { countries: CountryIndex }, limits: Limits, dry: boolean) {
    this.ctx = ctx;
    this.limits = limits;
    this.dry = dry;
  }

  run(name: string, input: unknown): ToolResult {
    const i = (input ?? {}) as Obj;
    try {
      switch (name) {
        case "list_rankings": return this.list(i);
        case "read_ranking": return this.read(i);
        case "create_ranking": return this.create(i);
        case "update_ranking": return this.update(i);
        case "record_finding": return this.record(i);
        default: return { text: `Unknown tool ${name}`, isError: true };
      }
    } catch (err) {
      return { text: `Tool failed: ${(err as Error).message}`, isError: true };
    }
  }

  private reject(tool: string, id: string | undefined, problems: string[]): ToolResult {
    this.rejected.push({ tool, id, problems });
    return { text: `Rejected — nothing was written:\n${problems.map((p) => `- ${p}`).join("\n")}`, isError: true };
  }

  private list(i: Obj): ToolResult {
    const cat = str(i.category), scope = str(i.scope);
    const rows = readAllRankings()
      .filter((r) => (!cat || r.category === cat) && (!scope || (scope === "world" ? !r.scope : r.scope === scope.toUpperCase())))
      .map((r) => `${r.id} | ${r.title} | ${r.category} | ${r.scope ?? "world"} | ${r.source.kind} | ${r.year} | ${ageDays(r)}d old | ${r.items.length} rows`);
    return { text: rows.length ? rows.join("\n") : "No rankings match." };
  }

  private read(i: Obj): ToolResult {
    const id = str(i.id);
    if (!rankingExists(id)) return { text: `No ranking "${id}".`, isError: true };
    const r = readRanking(id);
    const { items, ...meta } = r;
    const shown = i.all_rows === true || items.length <= 60 ? items : items.slice(0, 30);
    return { text: JSON.stringify({ ...meta, rowCount: items.length, rows: shown }) };
  }

  private buildSource(raw: Obj): Source {
    const s: Source = { kind: "agent", name: str(raw.name), url: str(raw.url), verified: false };
    if (Array.isArray(raw.urls)) s.urls = raw.urls.filter((u): u is string => typeof u === "string");
    if (str(raw.license)) s.license = str(raw.license);
    if (str(raw.note)) s.note = str(raw.note);
    return s;
  }

  private sourceProblems(s: Source): string[] {
    const out: string[] = [];
    for (const u of [s.url, ...(s.urls ?? [])]) {
      try {
        if (!/^https?:$/.test(new URL(u ?? "").protocol)) out.push(`source url must be http(s): ${u}`);
      } catch {
        out.push(`source url is not a valid URL: ${u}`);
      }
    }
    return out;
  }

  private cleanItems(raw: unknown, meta: Pick<RankingFile, "order" | "decimals">): Item[] {
    const rows = Array.isArray(raw) ? raw : [];
    const items = rows.map((x: Obj) => ({
      name: str(x.name).trim(),
      country: str(x.country).toUpperCase(),
      value: x.value as number,
      ...(str(x.detail) ? { detail: str(x.detail).trim() } : {}),
    }));
    // Same convention as scripts/update.mts: sorted, values rounded to two more decimals than displayed.
    return items
      .sort((a, b) => (meta.order === "asc" ? a.value - b.value : b.value - a.value) || a.name.localeCompare(b.name))
      .map((it) => (Number.isFinite(it.value) ? { ...it, value: Number(it.value.toFixed(meta.decimals + 2)) } : it));
  }

  private create(i: Obj): ToolResult {
    const id = str(i.id);
    if (this.created.length >= this.limits.maxNew) return this.reject("create_ranking", id, [`this run is limited to ${this.limits.maxNew} new ranking(s) and the limit is reached`]);
    const problems: string[] = [];
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) problems.push("id must be kebab-case (a-z, 0-9, dashes)");
    if (rankingExists(id) || PIPELINE_IDS.has(id)) problems.push(`id "${id}" already exists — pick another, or use update_ranking if it is hand-entered`);
    const order = i.order === "asc" ? "asc" : "desc";
    const decimals = Number.isInteger(i.decimals) ? (i.decimals as number) : -1;
    const source = this.buildSource((i.source ?? {}) as Obj);
    problems.push(...this.sourceProblems(source));
    const scope = str(i.scope).toUpperCase();
    const r: RankingFile = {
      id,
      title: str(i.title).trim(),
      ...(str(i.short) ? { short: str(i.short).trim() } : {}),
      category: str(i.category),
      icon: str(i.icon),
      desc: str(i.desc).trim(),
      unit: str(i.unit),
      prefix: str(i.prefix),
      suffix: str(i.suffix),
      decimals,
      order,
      ...(scope ? { scope } : {}),
      ...(i.multi === true ? { multi: true } : {}),
      year: i.year as number,
      ...(str(i.asOf) ? { asOf: str(i.asOf) } : {}),
      source,
      updatedAt: new Date().toISOString(),
      items: this.cleanItems(i.items, { order, decimals }),
    };
    if (scope && !r.items.every((it) => it.country === scope)) problems.push(`every item of a country-internal ranking must have country "${scope}"`);
    if (!scope && r.items.length < 20) problems.push(`a world ranking needs at least 20 rows (got ${r.items.length}) — a shorter list belongs in record_finding`);
    problems.push(...checkRanking(r, { countries: this.ctx.countries, categoryIds: CATEGORY_IDS }, id));
    if (problems.length) return this.reject("create_ranking", id, problems);

    if (!this.dry) writeRanking(r);
    this.created.push({ id, items: r.items.length });
    return { text: `${this.dry ? "[dry run] would create" : "Created"} ${id}: ${r.items.length} rows, #1 ${r.items[0].name} (${r.items[0].value}).` };
  }

  private update(i: Obj): ToolResult {
    const id = str(i.id);
    if (this.updated.length >= this.limits.maxUpdates) return this.reject("update_ranking", id, [`this run is limited to ${this.limits.maxUpdates} update(s) and the limit is reached`]);
    if (PIPELINE_IDS.has(id)) return this.reject("update_ranking", id, ["this ranking is maintained by an automatic pipeline (npm run data:update) — do not touch it"]);
    if (!rankingExists(id)) return this.reject("update_ranking", id, [`no ranking "${id}"`]);
    const prev = readRanking(id);
    if (prev.source.kind !== "manual" && prev.source.kind !== "agent") return this.reject("update_ranking", id, [`source kind "${prev.source.kind}" is not agent-editable`]);

    const problems: string[] = [];
    const source = this.buildSource((i.source ?? {}) as Obj);
    problems.push(...this.sourceProblems(source));
    const year = i.year as number;
    const asOf = str(i.asOf) || undefined;
    if (year < prev.year || (year === prev.year && (asOf ?? "") <= (prev.asOf ?? ""))) {
      problems.push(`not newer than what is stored (${prev.asOf ?? prev.year}). Only replace a ranking when a newer edition/period exists; otherwise leave it and say so.`);
    }
    const items = this.cleanItems(i.items, prev);
    const next: RankingFile = { ...prev, year, asOf, source, updatedAt: new Date().toISOString(), items };
    if (!asOf) delete next.asOf;
    // A hand-entered list of things (skyscrapers, universities…) legitimately repeats countries; keep it that way.
    if (!prev.scope && !prev.multi && new Set(prev.items.map((x) => x.country)).size < prev.items.length) next.multi = true;
    if (items.length < prev.items.length * 0.7) problems.push(`row count dropped ${prev.items.length} → ${items.length} (>30%)`);
    problems.push(...checkRanking(next, { countries: this.ctx.countries, categoryIds: CATEGORY_IDS }, id));

    // Compare by (name, country): what was added, dropped, and how far values moved.
    const key = (x: Item) => `${x.country}|${x.name}`;
    const before = new Map(prev.items.map((x) => [key(x), x.value]));
    const after = new Map(items.map((x) => [key(x), x.value]));
    const added = [...after.keys()].filter((k) => !before.has(k));
    const dropped = [...before.keys()].filter((k) => !after.has(k));
    const jumps = [...after].filter(([k, v]) => {
      const old = before.get(k);
      return old !== undefined && old !== 0 && (Math.abs(v / old) > MAX_JUMP || Math.abs(old / v) > MAX_JUMP);
    });
    const changed = [...after].filter(([k, v]) => before.has(k) && before.get(k) !== v).length;
    if (jumps.length && i.confirm_large_changes !== true) {
      problems.push(`${jumps.length} value(s) moved more than ${MAX_JUMP}x (e.g. ${jumps.slice(0, 3).map(([k, v]) => `${k}: ${before.get(k)} → ${v}`).join("; ")}). Re-check the source (units? wrong column?) and resend with confirm_large_changes=true if they are real.`);
    }
    if (problems.length) return this.reject("update_ranking", id, problems);
    if (!added.length && !dropped.length && !changed) return { text: `${id}: the new figures are identical to the stored ones — nothing written.` };

    const summary = `${str(i.change_summary)} [${changed} changed, ${added.length} added, ${dropped.length} dropped]`;
    if (!this.dry) writeRanking(next);
    this.updated.push({ id, summary });
    return { text: `${this.dry ? "[dry run] would update" : "Updated"} ${id} to ${asOf ?? year}: ${summary}.` };
  }

  private record(i: Obj): ToolResult {
    const topic = str(i.topic).trim();
    if (!topic) return { text: "topic is required", isError: true };
    if (!this.dry) {
      const notes = readNotes().filter((n) => n.topic.toLowerCase() !== topic.toLowerCase());
      notes.push({ topic, status: i.status === "candidate" ? "candidate" : "rejected", reason: str(i.reason), date: new Date().toISOString().slice(0, 10) });
      writeNotes(notes);
    }
    return { text: "Noted." };
  }
}

// Usage: node scripts/agent/index.mts <plan|discover|refresh|run> [options]
//   plan       print what the agent would work on (coverage gaps, stale rankings) — no API calls, no writes
//   discover   research and add new rankings
//   refresh    re-run the automatic pipelines (no LLM), then let the agent update stale hand-entered/agent rankings
//   run        refresh, then discover (what the scheduled job runs)
// Options: --dry  do everything but write files · --max-new N (3) · --max-updates N (5) · --stale-days N (30)
//          --category ID · --focus "text" · --max-turns N (40) · --max-tokens N (1500000) · --no-fallbacks
// Env:     ANTHROPIC_API_KEY (or `ant auth login`), AGENT_MODEL (claude-sonnet-5-5), AGENT_EFFORT (high)
import Anthropic from "@anthropic-ai/sdk";
import { spawnSync } from "node:child_process";
import { loadCountries } from "../lib/countries.mts";
import { coverage, renderCoverage } from "./gaps.mts";
import { runAgent } from "./loop.mts";
import { discoverTask, refreshTask, SYSTEM } from "./prompts.mts";
import { readAllRankings, readNotes, writeRunReport } from "./store.mts";
import { Toolbox } from "./tools.mts";
import type { RunReport } from "./store.mts";

const argv = process.argv.slice(2);
const mode = argv.find((a) => !a.startsWith("--")) ?? "plan";
const flag = (name: string) => argv.includes(`--${name}`);
const opt = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const num = (name: string, fallback: number) => (opt(name) ? Number(opt(name)) : fallback);

if (!["plan", "discover", "refresh", "run"].includes(mode)) {
  console.error(`Unknown mode "${mode}". Use plan | discover | refresh | run.`);
  process.exit(2);
}
const dry = flag("dry");
const maxNew = num("max-new", 3);
const maxUpdates = num("max-updates", 5);
const staleDays = num("stale-days", 30);
const model = process.env.AGENT_MODEL ?? "claude-sonnet-5-5";
const effort = (process.env.AGENT_EFFORT ?? "high") as "low" | "medium" | "high" | "xhigh" | "max";

const all = readAllRankings();
const cov = coverage(all, staleDays);

if (mode === "plan") {
  console.log(renderCoverage(cov, all));
  console.log(`\nEmpty categories: ${cov.emptyCategories.join(", ") || "none"}`);
  console.log(`\nDue for refresh (hand-entered or agent-collected, ≥ ${staleDays} days old): ${cov.stale.length}`);
  for (const s of cov.stale) console.log(`- ${s.id} (${s.kind}, ${s.ageDays} days, data year ${s.year}${s.verified ? ", verified" : ""})`);
  console.log(`\nAutomatic pipelines are refreshed with: npm run data:update`);
  process.exit(0);
}

const startedAt = new Date().toISOString();
const toolbox = new Toolbox({ countries: loadCountries() }, { maxNew, maxUpdates }, dry);
const client = new Anthropic();
const usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, requests: 0 };
const summaries: string[] = [];
let stopReason = "completed";
let failed = false;

async function phase(name: string, task: string) {
  console.log(`\n== ${name} ==`);
  let res;
  try {
    res = await runAgent(client as never, {
      model, effort, system: SYSTEM, task, toolbox,
      maxTurns: num("max-turns", 40), maxTokens: num("max-tokens", 1_500_000), webUses: 25,
      fallbacks: !flag("no-fallbacks"), log: console.log,
    });
  } catch (err) {
    // Whatever was submitted before the failure is already on disk and stays valid; report the error and carry on to the report.
    const msg = (err as Error).message;
    console.error(`\n✗ ${name} aborted: ${msg}`);
    stopReason = `${name}:error`;
    failed = true;
    summaries.push(`## ${name}\nAborted: ${msg}`);
    return;
  }
  for (const k of Object.keys(usage) as (keyof typeof usage)[]) usage[k] += res.usage[k];
  if (res.stopReason !== "end_turn") stopReason = `${name}:${res.stopReason}`;
  summaries.push(`## ${name}\n${res.summary}`);
  console.log(`\n${res.summary}\n(stopped: ${res.stopReason})`);
}

if (mode === "refresh" || mode === "run") {
  // 1. The automatic pipelines need no model: just run them. Failures are reported, never fatal here.
  console.log("== pipelines ==");
  const upd = spawnSync(process.execPath, ["scripts/update.mts", ...(dry ? ["--dry"] : [])], { stdio: "inherit" });
  if (upd.status) summaries.push(`## pipelines\nscripts/update.mts exited with ${upd.status}; failed rankings kept their old data.`);
  // 2. Hand-entered and agent-collected rankings: the model looks for newer editions.
  if (cov.stale.length) await phase("refresh", refreshTask({ maxUpdates, stale: cov.stale.slice(0, maxUpdates * 2), notes: readNotes() }));
  else console.log(`No hand-entered/agent rankings older than ${staleDays} days.`);
}
if (mode === "discover" || mode === "run") {
  await phase("discover", discoverTask({ maxNew, coverage: renderCoverage(cov, all), notes: readNotes(), category: opt("category"), focus: opt("focus") }));
}

const report: RunReport = {
  mode, model, dry, startedAt, finishedAt: new Date().toISOString(), stopReason, usage,
  created: toolbox.created, updated: toolbox.updated, rejected: toolbox.rejected, summary: summaries.join("\n\n"),
};
if (!dry) writeRunReport(report);
console.log(`\nDone${dry ? " (dry run)" : ""}: ${toolbox.created.length} created, ${toolbox.updated.length} updated, ${toolbox.rejected.length} submission(s) rejected. ${usage.requests} requests, ${usage.inputTokens + usage.outputTokens} tokens (${usage.cacheReadTokens} read from cache).`);
if (!dry && (toolbox.created.length || toolbox.updated.length)) {
  const v = spawnSync(process.execPath, ["scripts/validate.mts"], { stdio: "inherit" });
  if (v.status) process.exit(v.status);
}
if (failed) process.exit(1);

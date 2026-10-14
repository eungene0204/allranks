// Disk access for the agent: the ranking files it reads/writes, plus its own small state under data/agent/.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import type { RankingFile } from "../lib/types.mts";

const RANKINGS = new URL("../../data/rankings/", import.meta.url);
const AGENT_DIR = new URL("../../data/agent/", import.meta.url);

export const rankingFile = (id: string) => new URL(`${id}.json`, RANKINGS);
export const rankingExists = (id: string) => existsSync(rankingFile(id));
export const readRanking = (id: string): RankingFile => JSON.parse(readFileSync(rankingFile(id), "utf8"));
export const writeRanking = (r: RankingFile) => writeFileSync(rankingFile(r.id), JSON.stringify(r, null, 2) + "\n");

export function readAllRankings(): RankingFile[] {
  return readdirSync(RANKINGS).filter((f) => f.endsWith(".json")).sort().map((f) => readRanking(f.replace(/\.json$/, "")));
}

/** What earlier runs learned: topics that were tried and rejected (and why), or are worth doing next. Keeps a periodic agent from repeating dead ends. */
export type Note = { topic: string; status: "rejected" | "candidate"; reason: string; date: string };
const NOTES = new URL("notes.json", AGENT_DIR);

export function readNotes(): Note[] {
  return existsSync(NOTES) ? JSON.parse(readFileSync(NOTES, "utf8")) : [];
}
export function writeNotes(notes: Note[]) {
  mkdirSync(AGENT_DIR, { recursive: true });
  writeFileSync(NOTES, JSON.stringify(notes, null, 2) + "\n");
}

export type RunReport = {
  mode: string;
  model: string;
  dry: boolean;
  startedAt: string;
  finishedAt: string;
  stopReason: string;
  usage: { inputTokens: number; outputTokens: number; cacheReadTokens: number; requests: number };
  created: { id: string; items: number }[];
  updated: { id: string; summary: string }[];
  rejected: { tool: string; id?: string; problems: string[] }[];
  summary: string;
};
export function writeRunReport(r: RunReport) {
  mkdirSync(AGENT_DIR, { recursive: true });
  writeFileSync(new URL("last-run.json", AGENT_DIR), JSON.stringify(r, null, 2) + "\n");
  writeFileSync(new URL("last-run.md", AGENT_DIR), renderRunReport(r) + "\n");
}

/** Human-readable twin of last-run.json — used as the pull-request description by the scheduled workflow. */
export function renderRunReport(r: RunReport): string {
  const list = (xs: string[]) => (xs.length ? xs.map((x) => `- ${x}`).join("\n") : "- none");
  return [
    `## Data agent run (${r.mode}${r.dry ? ", dry" : ""})`,
    `Model \`${r.model}\` · ${r.usage.requests} requests · ${r.usage.inputTokens + r.usage.outputTokens} tokens · stopped: ${r.stopReason}`,
    "",
    "### New rankings",
    list(r.created.map((c) => `\`${c.id}\` (${c.items} rows)`)),
    "### Updated rankings",
    list(r.updated.map((u) => `\`${u.id}\` — ${u.summary}`)),
    "### Rejected submissions",
    list(r.rejected.map((x) => `${x.tool}${x.id ? ` \`${x.id}\`` : ""}: ${x.problems[0]}`)),
    "",
    "### Agent summary",
    r.summary || "(none)",
    "",
    "All agent-collected data is marked unverified on the site. Check the sources before merging.",
  ].join("\n");
}

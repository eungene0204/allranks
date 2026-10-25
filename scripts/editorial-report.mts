import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import type { Ranking } from "../src/lib/types.ts";
import { buildRankingArticle, type ArticleContext } from "../src/lib/ranking-article.ts";

const read = <T,>(path: string): T => JSON.parse(readFileSync(path, "utf8")) as T;
const definitions = read<ArticleContext["definitions"]>("data/editorial/worldbank-definitions.json");
const access = read<ArticleContext["access"]>("data/editorial/source-access.json");
const countryNames = Object.fromEntries(read<{ code: string; name: string }[]>("data/countries.json").map((country) => [country.code, country.name]));
const context = { definitions, access, countryNames };
const rankings = readdirSync("data/rankings").filter((file) => file.endsWith(".json")).sort().map((file) => read<Ranking>(`data/rankings/${file}`));
const isPublic = (r: Ranking) => r.source.verified !== false && (!["manual", "agent"].includes(r.source.kind) || r.source.verified === true);
const profiles: Record<string, number> = {};
const hashes = new Map<string, string>();
const failures: string[] = [];
const rows: { id: string; profile: string; words: number; sourceAccess: string; hash: string }[] = [];
for (const r of rankings.filter(isPublic)) {
  // Match the neutral display title used by the public data loader.
  if (r.id === "internet-users") r.title = "Internet Use by Country";
  const article = buildRankingArticle(r, context);
  const paragraphs = article.sections.flatMap((section) => section.paragraphs);
  if (article.sections.length < 5 || paragraphs.some((paragraph) => !paragraph.trim())) failures.push(`${r.id}: incomplete explanation`);
  if (!article.references.length || !article.references.some((source) => source.url === r.source.url)) failures.push(`${r.id}: source attribution missing`);
  if (!paragraphs.some((paragraph) => paragraph.includes(r.title))) failures.push(`${r.id}: indicator-specific context missing`);
  if (!paragraphs.some((paragraph) => paragraph.includes(r.unit))) failures.push(`${r.id}: unit missing`);
  if (r.source.url?.includes("data.worldbank.org/indicator/")) {
    const code = decodeURIComponent(r.source.url.split("/indicator/")[1].split(/[?#]/)[0]);
    if (!definitions.indicators[code]) failures.push(`${r.id}: official indicator metadata missing for ${code}`);
  } else if (!article.sourceAccess) failures.push(`${r.id}: source accessibility record missing`);
  const body = paragraphs.join("\n");
  const hash = createHash("sha256").update(body).digest("hex");
  if (hashes.has(hash)) failures.push(`${r.id}: identical article body to ${hashes.get(hash)}`);
  hashes.set(hash, r.id);
  profiles[article.profile] = (profiles[article.profile] ?? 0) + 1;
  rows.push({ id: r.id, profile: article.profile, words: body.split(/\s+/).length, sourceAccess: r.source.url?.includes("data.worldbank.org/indicator/") ? "official-metadata-retrieved" : article.sourceAccess?.status === 200 ? "http-response-received" : "source-not-retrievable", hash });
}
const report = {
  note: "Coverage and content integrity only. Not an E-E-A-T score, expert review, or new verification of original observations.",
  publicRankings: rows.length,
  privateDrafts: rankings.filter((r) => !isPublic(r)).map((r) => r.id),
  officialWorldBankDefinitions: Object.keys(definitions.indicators).length,
  sourceAccessCounts: Object.fromEntries([...new Set(rows.map((row) => row.sourceAccess))].map((status) => [status, rows.filter((row) => row.sourceAccess === status).length])),
  profiles,
  failures,
  articles: rows,
};
if (process.argv.includes("--write")) writeFileSync("data/editorial/coverage.json", JSON.stringify(report, null, 2) + "\n");
console.log(`Editorial coverage: ${rows.length}/${rankings.filter(isPublic).length} public rankings; ${Object.keys(profiles).length} reading profiles; ${rankings.filter((r) => !isPublic(r)).length} private drafts; ${failures.length} errors.`);
if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }

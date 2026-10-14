// Which visualization each ranking page leads with (src/lib/viz.ts).
//   npm run viz:report                 summary: counts per kind, world rankings listed
//   npm run viz:report -- <id> [<id>…] the pick for those rankings, with the unit and size it was based on
import { readdirSync, readFileSync } from "node:fs";
import { VIZ_OVERRIDES, isAdditive, pickViz } from "../src/lib/viz.ts";
import type { RankingFile } from "../src/lib/types.ts";

const dir = new URL("../data/rankings/", import.meta.url);
const all = readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(new URL(f, dir), "utf8")) as RankingFile);

const ids = process.argv.slice(2);
if (ids.length) {
  for (const id of ids) {
    const r = all.find((x) => x.id === id);
    if (!r) { console.log(`${id}: not found`); process.exitCode = 1; continue; }
    const why = VIZ_OVERRIDES[id] ? "override" : r.items.some((i) => i.value < 0) ? "has negative values" : r.scope ? "regional" : r.multi ? "list of things" : isAdditive(r) ? "additive total" : "ratio / level";
    console.log(`${id}: ${pickViz(r) ?? "none"}  (${why}; unit "${r.unit}", ${r.items.length} entries)`);
  }
} else {
  const kinds = new Map<string, string[]>();
  for (const r of all) {
    const k = `${r.scope ? "regional " : ""}${pickViz(r) ?? "none"}`;
    kinds.set(k, [...(kinds.get(k) ?? []), r.id]);
  }
  for (const [k, v] of [...kinds].sort()) {
    console.log(`${k.padEnd(20)} ${String(v.length).padStart(4)}${k.startsWith("regional") ? "" : `  ${v.join(", ")}`}`);
  }
}

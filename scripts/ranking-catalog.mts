import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

// Shared client module: keep the catalog out of every page's serialized props.
const root = process.cwd();
const directory = path.join(root, "data/rankings");
const catalog = Object.fromEntries(readdirSync(directory).filter((file) => file.endsWith(".json")).sort().map((file) => {
  return JSON.parse(readFileSync(path.join(directory, file), "utf8")) as { id: string; category: string; source: { kind: string; verified?: boolean } };
}).filter((r) => r.source.verified !== false && (!["manual", "agent"].includes(r.source.kind) || r.source.verified === true)).map((ranking) => {
  return [ranking.id, ranking.category];
}));
const output = path.join(root, "src/generated/ranking-categories.json");
const content = `${JSON.stringify(catalog)}\n`;
mkdirSync(path.dirname(output), { recursive: true });
let previous: string | undefined;
try { previous = readFileSync(output, "utf8"); } catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}
if (previous !== content) writeFileSync(output, content);

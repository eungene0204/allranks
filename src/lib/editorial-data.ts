import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ArticleContext } from "./ranking-article";

let context: ArticleContext | undefined;
export function articleContext(): ArticleContext {
  if (context && process.env.NODE_ENV === "production") return context;
  const root = process.cwd();
  const definitions = JSON.parse(readFileSync(path.join(root, "data/editorial/worldbank-definitions.json"), "utf8")) as ArticleContext["definitions"];
  const access = JSON.parse(readFileSync(path.join(root, "data/editorial/source-access.json"), "utf8")) as ArticleContext["access"];
  const countries = JSON.parse(readFileSync(path.join(root, "data/countries.json"), "utf8")) as { code: string; name: string }[];
  context = { definitions, access, countryNames: Object.fromEntries(countries.map((country) => [country.code, country.name])) };
  return context;
}

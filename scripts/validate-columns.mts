import { readFileSync } from "node:fs";
import { columnDate, columnFiles, readColumn } from "../src/lib/columns.ts";
import type { RankingFile } from "./lib/types.mts";

const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const slug = (value: unknown) => text(value) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const day = (value: unknown) => text(value) && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(+columnDate(value)) && new Date(+columnDate(value) + 9 * 3600_000).toISOString().startsWith(value);
const unique = (values: string[]) => new Set(values).size === values.length;
const https = (value: unknown) => text(value) && URL.canParse(value) && new URL(value).protocol === "https:";

export function validateColumns() {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const file of columnFiles()) {
    const require = (valid: unknown, message: string) => {
      if (!valid) errors.push(`${file}: ${message}`);
    };
    try {
      const column = readColumn(file);
      if (column.verified === false) continue;
      require(column.verified === true, "set an explicit verified state");
      require(day(column.publishedOn) && file === `${column.publishedOn}.json`, "use a valid publication day as the filename");
      require(slug(column.id) && !ids.has(column.id), "use a unique URL slug");
      ids.add(column.id);
      require([column.title, column.summary, column.edition, column.sourceReview].every(text), "include title, summary, edition and source review");
      require(Array.isArray(column.sections) && column.sections.length > 0 && column.sections.every((section) =>
        text(section?.title) && Array.isArray(section.paragraphs) && section.paragraphs.length > 0 &&
        section.paragraphs.every(text) && unique(section.paragraphs)) && unique(column.sections.map(({ title }) => title)),
      "include sections with unique headings and substantive paragraphs");
      require(Array.isArray(column.sources) && column.sources.length > 0 &&
        column.sources.every((source) => text(source?.title) && https(source.url)) && unique(column.sources.map(({ url }) => url)),
      "include original sources with unique HTTPS URLs");
      if (column.table !== undefined) {
        const { caption, headers, rows } = column.table;
        require(text(caption) && Array.isArray(headers) && headers.length >= 2 && headers.every(text) && unique(headers) &&
          Array.isArray(rows) && rows.length > 0 && rows.every((row) => Array.isArray(row) && row.length === headers.length && row.every(text)) &&
          unique(rows.map(([label]) => label)),
        "include a caption and rectangular table with unique row and column headings");
      }
      require(Array.isArray(column.rankingIds) && column.rankingIds.length > 0 && unique(column.rankingIds), "include unique ranking IDs");
      for (const id of Array.isArray(column.rankingIds) ? column.rankingIds : []) {
        if (!slug(id)) {
          require(false, "ranking IDs must be URL slugs");
          continue;
        }
        try {
          const { source }: RankingFile = JSON.parse(readFileSync(new URL(`../data/rankings/${id}.json`, import.meta.url), "utf8"));
          require(source.verified !== false && (!["manual", "agent"].includes(source.kind) || source.verified === true), `${id} is not a public ranking`);
        } catch {
          require(false, `could not load ranking ${id}`);
        }
      }
    } catch (error) {
      errors.push(`${file}: ${(error as Error).message}`);
    }
  }
  return errors;
}

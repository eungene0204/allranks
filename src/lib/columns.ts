import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type Column = {
  id: string;
  title: string;
  summary: string;
  publishedOn: string;
  edition: string;
  sourceReview: string;
  verified: boolean;
  rankingIds: string[];
  sections: { title: string; paragraphs: string[] }[];
  table?: { caption: string; headers: string[]; rows: string[][] };
  sources: { title: string; url: string }[];
};

export const COLUMN_DIR = path.join(process.cwd(), "data", "columns");
export const columnPath = (id: string) => `/columns/${id}`;

export function columnDay(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

export function columnDate(day: string) {
  return new Date(`${day}T00:00:00+09:00`);
}

export function columnDateLabel(day: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long", timeZone: "Asia/Seoul",
  }).format(columnDate(day));
}

export function columnFiles() {
  return readdirSync(COLUMN_DIR).filter((file) => file.endsWith(".json")).sort().reverse();
}

export function readColumn(file: string): Column {
  return JSON.parse(readFileSync(path.join(COLUMN_DIR, file), "utf8")) as Column;
}

export function publishedColumns() {
  const today = columnDay();
  return columnFiles().map(readColumn).filter((column) =>
    column.verified === true && column.publishedOn <= today,
  );
}

export function getColumn(id: string) {
  return publishedColumns().find((column) => column.id === id);
}

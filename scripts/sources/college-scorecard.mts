import { inflateRawSync } from "node:zlib";
import type { Fetched, Item } from "../lib/types.mts";

// US Department of Education — College Scorecard, "Most Recent Cohorts: Institution" (public domain).
// Ranks real four-year schools on outcomes (selectivity, graduation, earnings, SAT). The file is a 23 MB zip holding one
// 100 MB CSV with 3,300 columns, so it is unzipped with node's zlib and only the handful of columns we need are kept.

const PAGE = "https://collegescorecard.ed.gov/data/";
const MIN_UNDERGRADS = 800; // keeps tiny seminaries and one-programme schools (whose rates are noisy) out of the rankings

const COLUMNS = ["INSTNM", "CITY", "STABBR", "PREDDEG", "CURROPER", "UGDS", "ADM_RATE", "SAT_AVG", "C150_4_POOLED", "MD_EARN_WNE_P10"] as const;
type Col = (typeof COLUMNS)[number];
type School = Record<Col, string>;

async function download(): Promise<{ zip: Buffer; url: string }> {
  const page = await (await fetch(PAGE, { signal: AbortSignal.timeout(60_000) })).text();
  const url = page.match(/https:\/\/[^"']*Most-Recent-Cohorts-Institution_\d+\.zip/)?.[0];
  if (!url) throw new Error("College Scorecard download link not found — the page layout changed");
  const res = await fetch(url, { signal: AbortSignal.timeout(300_000) });
  if (!res.ok) throw new Error(`GET ${url}: HTTP ${res.status}`);
  return { zip: Buffer.from(await res.arrayBuffer()), url };
}

/** Pull one file out of a (non-zip64) archive: find it in the central directory, inflate its data. */
function unzipOne(zip: Buffer, wanted: RegExp): string {
  let eocd = zip.length - 22;
  while (eocd >= 0 && zip.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error("not a zip file");
  let p = zip.readUInt32LE(eocd + 16);
  for (let n = zip.readUInt16LE(eocd + 10); n > 0; n--) {
    if (zip.readUInt32LE(p) !== 0x02014b50) throw new Error("corrupt zip directory");
    const method = zip.readUInt16LE(p + 10);
    const size = zip.readUInt32LE(p + 20);
    const nameLen = zip.readUInt16LE(p + 28);
    const next = p + 46 + nameLen + zip.readUInt16LE(p + 30) + zip.readUInt16LE(p + 32);
    const name = zip.toString("utf8", p + 46, p + 46 + nameLen);
    if (wanted.test(name) && !name.startsWith("__MACOSX")) {
      const local = zip.readUInt32LE(p + 42);
      const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
      const data = zip.subarray(start, start + size);
      return (method === 0 ? data : inflateRawSync(data)).toString("utf8");
    }
    p = next;
  }
  throw new Error(`${wanted} not found in the archive`);
}

/** Streams the CSV once, keeping only `COLUMNS` of each row (the full row objects would need gigabytes). */
function parseSelected(text: string): School[] {
  const out: School[] = [];
  let want: (Col | null)[] = [];
  let row: Partial<School> = {};
  let col = 0;
  let field = "";
  let quoted = false;
  let header = true;
  const endField = () => {
    if (header) want.push((COLUMNS as readonly string[]).includes(field.replace(/^﻿/, "")) ? (field.replace(/^﻿/, "") as Col) : null);
    else if (want[col]) row[want[col]!] = field;
    col++;
    field = "";
  };
  const endRow = () => {
    endField();
    if (!header && col > 1) out.push(row as School);
    header = false;
    row = {};
    col = 0;
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") endField();
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      endRow();
    } else field += c;
  }
  if (field !== "" || col) endRow();
  const missing = COLUMNS.filter((c) => !want.includes(c));
  if (missing.length) throw new Error(`College Scorecard columns missing: ${missing.join(", ")}`);
  return out;
}

let cached: Promise<{ schools: School[]; url: string }> | undefined;
const load = () =>
  (cached ??= download().then(({ zip, url }) => ({
    url,
    schools: parseSelected(unzipOne(zip, /Most-Recent-Cohorts-Institution\.csv$/)),
  })));

const num = (s: string) => (s === "" || s === "NULL" || s === "PrivacySuppressed" ? NaN : Number(s));

/**
 * One ranking from the Scorecard: four-year, degree-granting, currently operating schools with enough undergraduates,
 * best 100 by `metric`. `scale` converts (e.g. a 0–1 rate to percent).
 */
export const scorecard = (opts: { metric: "ADM_RATE" | "SAT_AVG" | "C150_4_POOLED" | "MD_EARN_WNE_P10"; scale?: number; order: "asc" | "desc"; what: string }) =>
  async (): Promise<Fetched> => {
    const { schools, url } = await load();
    const items: Item[] = schools
      .filter((s) => s.PREDDEG === "3" && s.CURROPER === "1" && num(s.UGDS) >= MIN_UNDERGRADS)
      .map((s) => ({ name: s.INSTNM.trim(), country: "US", value: num(s[opts.metric]) * (opts.scale ?? 1), detail: `${s.CITY}, ${s.STABBR}` }))
      .filter((i) => Number.isFinite(i.value) && i.value > 0)
      .sort((a, b) => (opts.order === "asc" ? a.value - b.value : b.value - a.value) || a.name.localeCompare(b.name))
      .slice(0, 100);
    const stamp = url.match(/_(\d{2})(\d{2})(\d{4})\.zip$/);
    return {
      year: stamp ? +stamp[3] : new Date().getFullYear(),
      source: {
        kind: "csv",
        name: "U.S. Department of Education — College Scorecard",
        url: "https://collegescorecard.ed.gov/data/",
        license: "Public domain (U.S. government work)",
        note: `${opts.what} Only four-year schools with at least ${MIN_UNDERGRADS} undergraduates are ranked.`,
      },
      items,
    };
  };

import { findTable, parseNum } from "../lib/wikipedia.mts";
import type { WikiTable } from "../lib/wikipedia.mts";
import type { Ctx, Fetched, Item } from "../lib/types.mts";
import { byCountry, clean, LICENSE, tablesOf, thisYear, wiki } from "./wikipedia-world.mts";

// Wikipedia-table adapters for the energy, mining, money, demographics and autos rankings. Each ranking names the
// original publisher in `source.name` (Ember, USGS, IMF, OICA…); Wikipedia is only the place the table is read from.

type Year = (t: WikiTable) => number | undefined;
/** "…(2024)" or "…(2022–24)" in the caption → the last year of the period. */
export const captionYear: Year = (t) => {
  const range = t.caption.match(/(\d{2})(\d{2})\s*[–-]\s*(\d{2})\b/);
  if (range) return +`${range[1]}${range[3]}`;
  const y = t.caption.match(/\b(20\d{2})\b/);
  return y ? +y[1] : undefined;
};
/** A year written in the header cell of the value column, e.g. "2025" or "(2025)". */
export const headerYear = (col: number): Year => (t) => {
  for (const row of t.rows.slice(0, 3)) {
    const m = row[col]?.match(/\b(19|20)\d{2}\b/);
    if (m) return +m[0];
  }
};
/** The year that most rows of a table agree on (for tables with a per-row "Year" column). */
export const modeYear = (col: number): Year => (t) => {
  const count = new Map<number, number>();
  for (const r of t.rows) {
    const cell = r.at(col)?.trim() ?? "";
    if (/^(19|20)\d{2}$/.test(cell)) count.set(+cell, (count.get(+cell) ?? 0) + 1);
  }
  return [...count].sort((a, b) => b[1] - a[1])[0]?.[0];
};

/** One row per country from a Wikipedia table: country name in column 0, the number in `valueCol`. */
export function wikiCountries(opts: {
  title: string;
  /** Text that must appear in the table's caption / first header rows. */
  find: string[];
  valueCol: number;
  scale?: number;
  year: Year | number;
  asOf?: (t: WikiTable) => string | undefined;
  /**
   * Wikipedia does not expand merged cells (colspan/rowspan), so a row with a merged or missing cell has its numbers
   * shifted one column to the left — reserves would be read as production. Rows shorter than `minCells` are dropped.
   */
  minCells?: number;
  rowFilter?: (row: string[]) => boolean;
  publisher: string;
  note?: string;
  label: string;
}) {
  return async (ctx: Ctx): Promise<Fetched> => {
    const found = findTable(await tablesOf(opts.title), ...opts.find);
    const t: WikiTable = { ...found, rows: found.rows.filter((r) => r.length >= (opts.minCells ?? 0) && (opts.rowFilter?.(r) ?? true)) };
    const year = typeof opts.year === "number" ? opts.year : opts.year(found);
    if (!year) throw new Error(`${opts.label}: could not read the data year — the Wikipedia layout probably changed`);
    const asOf = opts.asOf?.(t);
    return {
      year,
      ...(asOf ? { asOf } : {}),
      source: {
        kind: "wikipedia",
        name: `${opts.publisher} (via Wikipedia)`,
        url: wiki(opts.title),
        license: LICENSE,
        ...(opts.note ? { note: opts.note } : {}),
      },
      items: byCountry(ctx, t, 0, opts.valueCol, opts.scale ?? 1, opts.label),
    };
  };
}

/** The 50 largest companies by revenue (Fortune Global 500), each with its headquarters country. */
export const largestCompanies = () => async (ctx: Ctx): Promise<Fetched> => {
  const title = "List of largest companies by revenue";
  const t = findTable(await tablesOf(title), "Ranks", "Name", "Industry", "Revenue");
  const items: Item[] = [];
  let country = "";
  let industry = "";
  const isNumber = (c: string | undefined) => /^[\d,.]+$/.test((c ?? "").trim());
  for (const r of t.rows) {
    if (!isNumber(r[0]) || !r[1]) continue; // header rows
    // Merged cells (rowspan) are missing from a row instead of repeated: the industry cell when it equals the row above,
    // the headquarters cell likewise. So find the revenue relative to the name, and let missing cells inherit.
    const hasIndustry = !isNumber(r[2]);
    const revenueAt = hasIndustry ? 3 : 2;
    const value = parseNum(r[revenueAt]);
    if (!Number.isFinite(value)) continue;
    if (hasIndustry) industry = clean(r[2]);
    // Only cells with letters can be a country (an empty string would otherwise match a native-script alias).
    const hq = r.slice(revenueAt + 3).filter((c) => /[A-Za-z]/.test(c)).map((c) => ctx.countries.byName(clean(c))).find(Boolean);
    if (hq) country = hq.code;
    if (country) items.push({ name: clean(r[1]), country, value, detail: industry });
  }
  // The source is sorted by revenue; a row out of order means a shifted column was read.
  const misordered = items.findIndex((x, i) => i > 0 && x.value > items[i - 1].value);
  if (misordered >= 0) throw new Error(`largest-companies: ${items[misordered].name} is out of revenue order — the Wikipedia layout probably changed`);
  return {
    year: thisYear() - 1,
    source: { kind: "wikipedia", name: "Fortune Global 500 (via Wikipedia)", url: wiki(title), license: LICENSE, note: "Consolidated revenue of the most recent fiscal year; each company is placed in the country of its headquarters." },
    items,
  };
};

/** "…January 2026…" in a header cell → { year, asOf }. */
export const monthOfHeader = (t: WikiTable, col: number) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const m = (t.rows[0]?.[col] ?? "").match(new RegExp(`(${months.join("|")}) (\\d{4})`));
  return m ? { year: +m[2], asOf: `${m[2]}-${String(months.indexOf(m[1]) + 1).padStart(2, "0")}` } : undefined;
};



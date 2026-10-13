import { findTable, parseNum, wikiHtml, wikiTables } from "../lib/wikipedia.mts";
import type { WikiTable } from "../lib/wikipedia.mts";
import type { Ctx, Fetched, Item } from "../lib/types.mts";

// Worldwide rankings whose numbers have no free API (wealth, Nobel prizes, websites, cities, commodities).
// Read from the tables of the English Wikipedia (CC BY-SA); each `source` names the original publisher.

const LICENSE = "CC BY-SA 4.0 (Wikipedia); underlying data © the cited publisher";
const wiki = (title: string) => `https://en.wikipedia.org/wiki/${title.replace(/ /g, "_")}`;
const tablesOf = async (title: string) => wikiTables(await wikiHtml(title));
const thisYear = () => new Date().getFullYear();
const clean = (s: string | undefined) => (s ?? "").replace(/\[[^\]]*\]/g, "").replace(/\s*\*?\s*\(OPEC\+?\)\s*$/, "").replace(/[*†‡]+/g, "").trim();

/** One row per country: [name in column `nameCol`, number in column `valueCol`]. Unmatched names are reported, not guessed. */
function byCountry(ctx: Ctx, table: WikiTable, nameCol: number, valueCol: number, scale = 1, label = ""): Item[] {
  const items: Item[] = [];
  const unmatched: string[] = [];
  const seen = new Set<string>();
  for (const row of table.rows) {
    // nameCol -1: find the country cell (rank cells of tied rows are merged away, which shifts the columns).
    const at = nameCol >= 0 ? nameCol : row.findIndex((c) => !/^[\d,.\s]*$/.test(c) && ctx.countries.byName(clean(c)));
    if (at < 0) continue;
    const name = clean(row[at]);
    const value = parseNum(row[at + (valueCol - Math.max(nameCol, 0))]) * scale;
    if (!name || /^[\d,.\s]*$/.test(name) || !Number.isFinite(value) || /^(world|total|global)/i.test(name)) continue;
    const c = ctx.countries.byName(name);
    if (!c) {
      unmatched.push(name);
      continue;
    }
    if (seen.has(c.code)) continue; // first row wins (tables are sorted best-first)
    seen.add(c.code);
    items.push({ name: c.name, country: c.code, value });
  }
  if (unmatched.length) console.warn(`  ! ${label}: could not match ${unmatched.length} name(s): ${unmatched.slice(0, 8).join(", ")}${unmatched.length > 8 ? "…" : ""}`);
  return items;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthOf = (text: string) => {
  const m = text.match(new RegExp(`(${MONTHS.join("|")}) (\\d{4})`));
  return m ? { year: +m[2], asOf: `${m[2]}-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, "0")}` } : undefined;
};

export const billionaires = () => async (ctx: Ctx): Promise<Fetched> => {
  const title = "List of countries by number of billionaires";
  const t = findTable(await tablesOf(title), "Billionaires", "Country/Territory", "Rate");
  const when = monthOf(t.caption);
  return {
    year: when?.year ?? thisYear(), ...(when ? { asOf: when.asOf } : {}),
    source: { kind: "wikipedia", name: "Forbes World's Billionaires list (via Wikipedia)", url: wiki(title), license: LICENSE },
    // Rows: [rank, country, 2026 count, 2025 count, …] — the rank cell is missing on tied rows, so find the country cell.
    items: byCountry(ctx, t, -1, 1, 1, "billionaires"),
  };
};

export const millionaires = () => async (ctx: Ctx): Promise<Fetched> => {
  const title = "List of countries by number of millionaires";
  const t = findTable(await tablesOf(title), "millionaires by country", "UBS");
  const year = +(t.caption.match(/\((\d{4})\)/)?.[1] ?? thisYear());
  return {
    year,
    source: { kind: "wikipedia", name: "UBS Global Wealth Report (via Wikipedia)", url: wiki(title), license: LICENSE },
    items: byCountry(ctx, t, 0, 1, 1e-6, "millionaires"),
  };
};

export const nobelLaureates = () => async (ctx: Ctx): Promise<Fetched> => {
  const title = "List of Nobel laureates by country";
  const t = findTable(await tablesOf(title), "Number of Nobel laureates by country");
  return {
    year: thisYear(),
    source: { kind: "wikipedia", name: "Nobel Foundation, laureates by country of affiliation (via Wikipedia)", url: wiki(title), license: LICENSE },
    items: byCountry(ctx, t, 0, 1, 1, "nobel"),
  };
};

export const largestCities = () => async (ctx: Ctx): Promise<Fetched> => {
  const title = "List of largest cities";
  const t = findTable(await tablesOf(title), "City", "Country", "UN 2025 population estimates");
  const items: Item[] = [];
  for (const r of t.rows) {
    const value = parseNum(r[2]);
    const c = ctx.countries.byName(clean(r[1]));
    if (clean(r[0]) && c && Number.isFinite(value) && value > 1e6) items.push({ name: clean(r[0]), country: c.code, value, detail: c.name });
  }
  return {
    year: 2025,
    source: { kind: "wikipedia", name: "United Nations, World Urbanization Prospects 2025 (via Wikipedia)", url: wiki(title), license: LICENSE, note: "Population of the whole urban agglomeration, which is why Jakarta tops the list." },
    items: items.slice(0, 50),
  };
};

export const topWebsites = () => async (ctx: Ctx): Promise<Fetched> => {
  const title = "List of most-visited websites";
  const t = findTable(await tablesOf(title), "Website", "Domain name", "Similarweb");
  const header = t.rows[0].find((c) => /Similarweb/.test(c)) ?? "";
  const when = monthOf(header);
  const items: Item[] = [];
  for (const r of t.rows.slice(1)) {
    const rank = parseNum(r[2]);
    const c = ctx.countries.byName(clean(r[r.length - 1]));
    if (clean(r[0]) && c && Number.isFinite(rank)) items.push({ name: clean(r[0]), country: c.code, value: rank, detail: clean(r[1]) });
  }
  return {
    year: when?.year ?? thisYear(), ...(when ? { asOf: when.asOf } : {}),
    source: { kind: "wikipedia", name: "Similarweb traffic ranking (via Wikipedia)", url: wiki(title), license: LICENSE },
    items,
  };
};

export const oilReserves = () => async (ctx: Ctx): Promise<Fetched> => {
  const title = "List of countries by proven oil reserves";
  const t = findTable(await tablesOf(title), "Proven reserves", "U.S. EIA");
  return {
    year: thisYear(),
    source: { kind: "wikipedia", name: "U.S. Energy Information Administration, proven crude oil reserves (via Wikipedia)", url: wiki(title), license: LICENSE },
    // Millions of barrels → billions.
    items: byCountry(ctx, t, 0, 1, 1e-3, "oil"),
  };
};

export const coffee = () => async (ctx: Ctx): Promise<Fetched> => {
  const title = "List of countries by coffee production";
  const t = findTable(await tablesOf(title), "green coffee production");
  const year = +(t.caption.match(/(\d{4})/)?.[1] ?? thisYear());
  return {
    year,
    source: { kind: "wikipedia", name: "FAO, green coffee production (via Wikipedia)", url: wiki(title), license: LICENSE },
    items: byCountry(ctx, t, 0, 1, 1e-3, "coffee"), // tonnes → thousand tonnes
  };
};

export const wine = () => async (ctx: Ctx): Promise<Fetched> => {
  const title = "List of countries by wine production";
  const t = findTable(await tablesOf(title), "Wine production by country");
  const year = +(t.caption.match(/(\d{4})/)?.[1] ?? thisYear());
  return {
    year,
    source: { kind: "wikipedia", name: "FAO, wine production (via Wikipedia)", url: wiki(title), license: LICENSE },
    items: byCountry(ctx, t, 0, 1, 1e-3, "wine"), // tonnes → thousand tonnes
  };
};

import { findTable, parseNum, wikiHtml, wikiTables } from "../lib/wikipedia.mts";
import type { WikiTable } from "../lib/wikipedia.mts";
import type { Fetched, Item, Source } from "../lib/types.mts";

// Rankings that exist only for the United States — states, cities, universities, companies… — read from the
// tables of the English Wikipedia (CC BY-SA), which in turn cite the agencies named in each `source`.

const LICENSE = "CC BY-SA 4.0 (Wikipedia); underlying data © the cited agency";
const US = "US";

/** The 50 states plus D.C. — every other row a source lists (Puerto Rico, "United States", …) is dropped. */
const STATES = new Set([
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida",
  "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
]);

const page = (title: string) => `https://en.wikipedia.org/wiki/${title.replace(/ /g, "_")}`;
const source = (name: string, title: string, note?: string): Source => ({
  kind: "wikipedia",
  name: `${name} (via Wikipedia)`,
  url: page(title),
  license: LICENSE,
  ...(note ? { note } : {}),
});

/** "Washington, D.C." / "Alabama[a]" → the canonical state name, or undefined when the row isn't a state. */
function stateName(cell: string | undefined): string | undefined {
  const name = (cell ?? "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\s*\(.*\)\s*$/, "")
    .replace(/^Washington,? D\.?C\.?$/i, "District of Columbia")
    .replace(/^Washington DC$/i, "District of Columbia")
    .trim();
  return STATES.has(name) ? name : undefined;
}

const text = (s: string | undefined) => (s ?? "").replace(/\[[^\]]*\]/g, "").replace(/[†‡*]+/g, "").trim();

const tablesOf = async (title: string) => wikiTables(await wikiHtml(title));

/** Make item names unique (the same building or city name can occur twice) by appending the detail. */
function unique(items: Item[]): Item[] {
  const seen = new Map<string, number>();
  return items.map((i) => {
    const n = (seen.get(i.name) ?? 0) + 1;
    seen.set(i.name, n);
    return n === 1 ? i : { ...i, name: `${i.name} (${i.detail ?? n})` };
  });
}

/** A ranking of the states: one row per state, value read from `valueOf(row)`. */
function statesFrom(table: WikiTable, valueOf: (row: string[]) => number, scale = 1, optional: string[] = []): Item[] {
  const items: Item[] = [];
  for (const row of table.rows) {
    const name = stateName(row[0]);
    const value = valueOf(row) * scale;
    if (name && Number.isFinite(value) && !items.some((i) => i.name === name)) items.push({ name, country: US, value });
  }
  const names = new Set(items.map((i) => i.name));
  const missing = [...STATES].filter((s) => !names.has(s) && !optional.includes(s));
  if (missing.length) throw new Error(`missing ${missing.length} state(s), e.g. ${missing.slice(0, 3).join(", ")} — the Wikipedia layout probably changed`);
  return items;
}

const thisYear = () => new Date().getFullYear();

// ── States ────────────────────────────────────────────────────────────────────────────────────

/** Seasonally adjusted unemployment rate by state (BLS LAUS). */
export async function usUnemployment(): Promise<Fetched> {
  const title = "List of U.S. states and territories by unemployment rate";
  const t = findTable(await tablesOf(title), "Unemployment rate", "Reference period");
  const period = t.rows.map((r) => r[2]?.match(/^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/)).find(Boolean);
  if (!period) throw new Error("reference period not found");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return {
    year: +period[2],
    asOf: `${period[2]}-${String(months.indexOf(period[1]) + 1).padStart(2, "0")}`,
    source: source("U.S. Bureau of Labor Statistics, Local Area Unemployment Statistics", title),
    items: statesFrom(t, (r) => parseNum(r[1])),
  };
}

/** Median household income by state (Census ACS 1-year); the table's first year column is the latest. */
export async function usHouseholdIncome(): Promise<Fetched> {
  const title = "List of U.S. states and territories by income";
  const t = findTable(await tablesOf(title), "ranked by median household income");
  const head = t.rows.find((r) => /^20\d\d$/.test(r[1] ?? ""));
  if (!head) throw new Error("year column not found");
  return {
    year: +head[1],
    source: source("U.S. Census Bureau, American Community Survey 1-year, table S1901", title),
    items: statesFrom(t, (r) => parseNum(r[1])),
  };
}

/** Share of households that own a gun (RAND 2016) plus CDC gun-death rates, from one table. */
const gunTable = async () => findTable(await tablesOf("Gun death and violence in the United States by state"), "% gun at home");

export async function usGunOwnership(): Promise<Fetched> {
  const title = "Gun death and violence in the United States by state";
  return {
    year: 2016,
    source: source("RAND Corporation, State-Level Estimates of Household Firearm Ownership (2016)", title, "RAND's figures are survey-based estimates; 2016 is the newest year available for every state. RAND publishes none for D.C."),
    items: statesFrom(await gunTable(), (r) => parseNum(r[5]), 1, ["District of Columbia"]),
  };
}

export const usGunDeathRate = (kind: "homicide" | "suicide") => async (): Promise<Fetched> => {
  const title = "Gun death and violence in the United States by state";
  const col = kind === "homicide" ? 3 : 1;
  return {
    year: 2021,
    source: source("CDC WONDER, firearm deaths per 100,000 residents (2021)", title),
    items: statesFrom(await gunTable(), (r) => parseNum(r[col]), 1, kind === "homicide" ? ["New Hampshire", "Vermont"] : []), // CDC suppresses tiny counts
  };
};

/** FBI-reported intentional homicides per 100,000 residents; last column is the latest year. */
export async function usHomicideRate(): Promise<Fetched> {
  const title = "List of U.S. states and territories by intentional homicide rate";
  const t = findTable(await tablesOf(title), "Homicides per 100,000 people by year", "FBI");
  const head = t.rows.find((r) => r[0] === "Location")!;
  const last = head.length - 1;
  return {
    year: +head[last],
    source: source("FBI Uniform Crime Reporting, homicides per 100,000 residents", title),
    items: statesFrom(t, (r) => parseNum(r[last])),
  };
}

export async function usPoverty(): Promise<Fetched> {
  const title = "List of U.S. states and territories by poverty rate";
  const t = findTable(await tablesOf(title), "Area", "Percent", "Error");
  return {
    year: 2023,
    source: source("U.S. Census Bureau, American Community Survey (2023)", title),
    items: statesFrom(t, (r) => parseNum(r[1])),
  };
}

export async function usStatePopulation(): Promise<Fetched> {
  const title = "List of U.S. states and territories by population";
  const t = findTable(await tablesOf(title), "Census population", "House seats");
  const estimate = t.rows.slice(0, 4).flat().map((c) => c.match(/July 1, (\d{4}) \(est\.\)/)?.[1]).find(Boolean);
  if (!estimate) throw new Error("estimate year not found");
  // Data rows may start with a rank cell: [rank, state, estimate, 2020 census, …] → drop everything before the state.
  const rows = t.rows.map((r) => {
    const i = r.findIndex((c) => stateName(c));
    return i > 0 ? r.slice(i) : r;
  });
  return {
    year: +estimate,
    source: source("U.S. Census Bureau, Population Estimates Program", title),
    items: statesFrom({ ...t, rows }, (r) => parseNum(r[1]), 1e-6),
  };
}

export async function usPopulationDensity(): Promise<Fetched> {
  const title = "List of U.S. states and territories by population density";
  const t = findTable(await tablesOf(title), "Location", "Density", "Land area");
  return {
    year: 2023,
    source: source("U.S. Census Bureau (population 2023, land area 2010)", title),
    items: statesFrom(t, (r) => parseNum(r[1])),
  };
}

export async function usStateArea(): Promise<Fetched> {
  const title = "List of U.S. states and territories by area";
  const t = findTable(await tablesOf(title), "State / territory", "Total area");
  return {
    year: 2010,
    source: source("U.S. Census Bureau, total area", title),
    // Row: [state, km², mi², …] → square miles.
    items: statesFrom(t, (r) => parseNum(r[2])),
  };
}

/** Nominal GDP (millions of USD → billions) or GDP per person, latest year in the table. */
export const usGdp = (kind: "total" | "per-capita") => async (): Promise<Fetched> => {
  const title = "List of U.S. states and territories by GDP";
  const t = findTable(await tablesOf(title), "Nominal GDP at current prices", "Nominal GDP per capita");
  const year = Math.max(...t.rows.slice(0, 4).flat().filter((c) => /^20\d\d$/.test(c)).map(Number)); // latest year in the sub-header
  return {
    year,
    source: source("U.S. Bureau of Economic Analysis, GDP by state", title),
    // Row: [state, GDP year-1, GDP year, % share…, population, GDP per capita]
    items: kind === "total" ? statesFrom(t, (r) => parseNum(r[2]), 1e-3) : statesFrom(t, (r) => parseNum(r[r.length - 1])),
  };
};

export async function usLifeExpectancy(): Promise<Fetched> {
  const title = "List of U.S. states and territories by life expectancy";
  const t = findTable(await tablesOf(title), "state", "2019", "2021");
  // Row: [state, 2019 (overall, male, female, F−M), Δ, 2020 (×4), Δ, 2021 (overall, …)] → 2021 overall is cell 11.
  return {
    year: 2021,
    source: source("CDC National Center for Health Statistics, life expectancy at birth (2021)", title),
    items: statesFrom(t, (r) => (r.length >= 16 ? parseNum(r[11]) : NaN)),
  };
}

// ── Institutions, cities, companies ───────────────────────────────────────────────────────────────

export async function usCollegeEndowment(): Promise<Fetched> {
  const title = "List of colleges and universities in the United States by endowment";
  const t = findTable(await tablesOf(title), "Rank", "Institution", "endowment (billions USD)");
  const year = +(t.rows[0].find((c) => /FY(\d{4}) endowment/.test(c))?.match(/FY(\d{4})/)?.[1] ?? thisYear());
  const items: Item[] = t.rows
    .filter((r) => /^\d+$/.test(r[0] ?? ""))
    .map((r) => ({ name: text(r[1]).replace(/^The Trustees of /, "").replace(/^The /, ""), country: US, value: parseNum(r[3]), detail: text(r[2]) }))
    .filter((i) => i.name && Number.isFinite(i.value));
  return {
    year,
    source: source(`National Association of College and University Business Officers (FY${year})`, title),
    items: unique(items),
  };
}

export async function usPublicEnrollment(): Promise<Fetched> {
  const title = "List of United States public university campuses by enrollment";
  // The page stacks one "Ten largest … during the 2025–26 academic year" table per year, newest first.
  const t = (await tablesOf(title)).find((t) => /Ten largest public university campuses by enrollment/.test(`${t.caption} ${t.rows[0]?.[0]}`));
  if (!t) throw new Error("latest enrollment table not found");
  const years = `${t.caption} ${t.rows[0]?.[0]}`.match(/(\d{4})[–-](\d{2,4})/);
  const items: Item[] = t.rows
    .filter((r) => /^\d+$/.test(r[0] ?? ""))
    .map((r) => ({ name: text(r[1]), country: US, value: parseNum(r[3]), detail: text(r[2]) }));
  return {
    year: years ? +years[1] : thisYear(),
    source: source(`University systems and the Integrated Postsecondary Education Data System, ${years?.[0] ?? ""}`.trim(), title),
    items: unique(items),
  };
}

export async function usCities(): Promise<Fetched> {
  const title = "List of United States cities by population";
  const t = findTable(await tablesOf(title), "Municipality", "estimate", "2020 census");
  const year = +(t.rows[0].find((c) => /^\d{4} estimate$/.test(c))?.match(/\d{4}/)?.[0] ?? thisYear());
  const items: Item[] = t.rows
    .filter((r) => /^[A-Z]{2}$/.test(r[1] ?? ""))
    .map((r) => ({ name: `${text(r[0])}, ${r[1]}`, country: US, value: parseNum(r[2]) }))
    .filter((i) => Number.isFinite(i.value))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100);
  return {
    year,
    source: source(`U.S. Census Bureau, ${year} city population estimates`, title, "The 100 largest incorporated places."),
    items: unique(items),
  };
}

export async function usCompanies(): Promise<Fetched> {
  const title = "List of largest companies in the United States by revenue";
  const t = findTable(await tablesOf(title), "Rank", "Revenue (USD millions)", "Headquarters");
  const items: Item[] = t.rows
    .filter((r) => /^\d+$/.test(r[0] ?? ""))
    .map((r) => ({ name: text(r[1]), country: US, value: parseNum(r[3]) / 1000, detail: text(r[2]) }))
    .filter((i) => i.name && Number.isFinite(i.value));
  return {
    year: 2025,
    source: source("Fortune 500 (2025), revenue of fiscal year 2024", title),
    items: unique(items),
  };
}

// ── Landmarks ─────────────────────────────────────────────────────────────────────────────────────

/** "541.3 m (1,776 ft)" or "1,776 ft (541 m)" → metres. */
function metres(cell: string | undefined): number {
  const m = (cell ?? "").match(/([\d,.]+)\s*m\b/);
  if (m) return parseNum(m[1]);
  const ft = (cell ?? "").match(/([\d,.]+)\s*ft/);
  return ft ? parseNum(ft[1]) * 0.3048 : NaN;
}

export async function usTallestBuildings(): Promise<Fetched> {
  const title = "List of tallest buildings in the United States";
  const t = findTable(await tablesOf(title), "Name", "Location", "Floors", "Year");
  const items: Item[] = t.rows
    .slice(1)
    .map((r) => ({
      name: text(r[0]),
      country: US,
      value: metres(r[3]),
      // "New York City 40°42′46.45″N …" → "New York City"
      detail: text(r[2]).replace(/\s*\d.*$/, ""),
    }))
    .filter((i) => i.name && Number.isFinite(i.value));
  return { year: thisYear(), source: source("Emporis / CTBUH, architectural height", title), items: unique(items) };
}

export async function usAirports(): Promise<Fetched> {
  const title = "List of the busiest airports in the United States";
  const all = await tablesOf(title);
  const year = +(findTable(all, "Rank (2025)", "Airports (large)").rows[0][0].match(/\((\d{4})\)/)?.[1] ?? thisYear());
  const items: Item[] = [];
  for (const t of [findTable(all, "Airports (large)"), findTable(all, "Airports (medium hubs)")]) {
    const col = t.rows[0].findIndex((c) => c === String(year));
    for (const r of t.rows) {
      if (!/^\d+$/.test(r[0] ?? "")) continue;
      const value = parseNum(r[col]) / 1e6;
      if (Number.isFinite(value)) items.push({ name: text(r[1]), country: US, value, detail: `${text(r[3])}, ${text(r[5])}` });
    }
  }
  return {
    year,
    source: source(`FAA / Bureau of Transportation Statistics, passenger enplanements (${year})`, title, "Large and medium hub airports."),
    items: unique(items),
  };
}

export async function usNationalParks(): Promise<Fetched> {
  const title = "List of national parks of the United States";
  const t = findTable(await tablesOf(title), "Name", "Recreation visitors");
  const col = t.rows[0].findIndex((c) => /Recreation visitors/.test(c));
  const year = +(t.rows[0][col].match(/\((\d{4})\)/)?.[1] ?? thisYear());
  const items: Item[] = t.rows
    .slice(1)
    .map((r) => ({
      name: text(r[0]),
      country: US,
      value: parseNum(r[col]) / 1e6,
      // "Maine 44°21′N 68°13′W …" → "Maine"
      detail: text(r[2]).replace(/\s*\d.*$/, ""),
    }))
    .filter((i) => i.name && Number.isFinite(i.value));
  return { year, source: source(`National Park Service, recreation visits (${year})`, title), items: unique(items) };
}

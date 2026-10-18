import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Ranking } from "./types";
import { parseCsv } from "../../scripts/lib/csv.mts";

type WorldBankRow = { countryiso3code: string; date: string; value: number | null };
const countryRows = JSON.parse(readFileSync(path.join(process.cwd(), "data/countries.json"), "utf8")) as { code: string; code3: string; name: string }[];
const countryCodes = new Map(countryRows.map((country) => [country.code3, country.code]));
const countryNames = new Map(countryRows.map((country) => [country.code, country.name]));
export type HistoryPoint = { year: number; value: number; rank: number; count: number };
export type RankingHistory = { points: HistoryPoint[]; source: string; revised: boolean };

export function supportsHistory(r: Ranking) {
  if (r.scope || r.multi || !r.source.url) return false;
  const url = new URL(r.source.url);
  return (url.hostname === "data.worldbank.org" && /^\/indicator\/[A-Za-z0-9.]+$/.test(url.pathname)) ||
    (url.hostname === "ourworldindata.org" && /^\/grapher\/[A-Za-z0-9-]+$/.test(url.pathname));
}

/** Infer the registry's unit multiplier against the saved snapshot; refuse ambiguous conversions. */
function snapshotScale(r: Ranking, values: Map<string, number>) {
  const matches = r.items.filter((item) => item.value !== 0 && values.has(item.country));
  if (matches.length < 3) return undefined;
  const candidates = [1e-12, 1e-9, 1e-6, 1e-3, 1, 100];
  const scored = candidates.map((scale) => {
    const errors = matches.map((item) => Math.abs(item.value - values.get(item.country)! * scale) / Math.max(Math.abs(item.value), 1e-9)).sort((a, b) => a - b);
    return { scale, error: errors[Math.floor(errors.length / 2)] };
  }).sort((a, b) => a.error - b.error);
  return scored[0].error <= 0.15 ? scored[0].scale : undefined;
}

function rankInYear(values: Map<string, number>, country: string, order: Ranking["order"]) {
  const sorted = [...values].sort(([a, av], [b, bv]) =>
    (order === "asc" ? av - bv : bv - av) || (countryNames.get(a) ?? a).localeCompare(countryNames.get(b) ?? b));
  return sorted.findIndex(([code]) => code === country) + 1;
}

export async function getRankingHistory(r: Ranking, country: string): Promise<RankingHistory | null> {
  if (!supportsHistory(r) || !r.items.some((item) => item.country === country)) return null;
  if (new URL(r.source.url!).hostname === "ourworldindata.org") return getOwidHistory(r, country);
  const indicator = new URL(r.source.url!).pathname.split("/").at(-1)!;
  const currentYear = new Date().getFullYear();
  const firstYear = Math.max(1960, Math.min(r.year - 9, currentYear - 9));
  const url = `https://api.worldbank.org/v2/country/all/indicator/${encodeURIComponent(indicator)}?format=json&per_page=20000&date=${firstYear}:${currentYear}`;
  const response = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`World Bank returned HTTP ${response.status}`);
  const [meta, raw] = await response.json() as [{ pages: number }, WorldBankRow[] | null];
  if (!raw || meta.pages > 1) return null;

  const byYear = new Map<number, Map<string, number>>();
  for (const row of raw) {
    const code = countryCodes.get(row.countryiso3code);
    const year = Number(row.date);
    if (!code || row.value === null || !Number.isFinite(row.value) || !Number.isInteger(year)) continue;
    const values = byYear.get(year) ?? new Map<string, number>();
    values.set(code, row.value);
    byYear.set(year, values);
  }
  const snapshotValues = byYear.get(r.year);
  if (!snapshotValues) return null;
  const scale = snapshotScale(r, snapshotValues);
  if (scale === undefined) return null;

  const points = [...byYear].filter(([, values]) => values.size >= 10 && values.has(country))
    .sort(([a], [b]) => a - b).slice(-10)
    .map(([year, values]) => {
      const rawValue = values.get(country)!;
      const rank = rankInYear(values, country, r.order);
      return { year, value: rawValue * scale, rank, count: values.size };
    });
  const saved = r.items.find((item) => item.country === country)!;
  const atSnapshot = points.find((point) => point.year === r.year);
  const revised = !!atSnapshot && Math.abs(atSnapshot.value - saved.value) > Math.max(Math.abs(saved.value) * 0.005, 10 ** -r.decimals);
  return { points, source: url, revised };
}

async function getOwidHistory(r: Ranking, country: string): Promise<RankingHistory | null> {
  const url = new URL(r.source.url!);
  url.pathname += ".csv";
  url.searchParams.set("useColumnShortNames", "true");
  const response = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Our World in Data returned HTTP ${response.status}`);
  const csv = await response.text();
  if (csv.length > 25_000_000) return null;
  const rows = parseCsv(csv);
  if (!rows.length || !rows[0].year) return null;
  const fields = Object.keys(rows[0]).filter((key) => !["entity", "code", "year", "day"].includes(key));
  for (const field of fields) {
    const byYear = new Map<number, Map<string, number>>();
    for (const row of rows) {
      const code = countryCodes.get(row.code);
      const year = Number(row.year);
      const value = Number(row[field]);
      if (!code || (r.id === "ai-publications-per-capita" && code === "VA") || !/^\d{4}$/.test(row.year) || row[field] === "" || !Number.isFinite(value)) continue;
      const values = byYear.get(year) ?? new Map<string, number>();
      values.set(code, value);
      byYear.set(year, values);
    }
    const snapshotValues = byYear.get(r.year);
    const scale = snapshotValues && snapshotScale(r, snapshotValues);
    if (scale === undefined) continue;
    const points = [...byYear].filter(([, values]) => values.size >= 10 && values.has(country))
      .sort(([a], [b]) => a - b).slice(-10)
      .map(([year, values]) => {
        const rawValue = values.get(country)!;
        const rank = rankInYear(values, country, r.order);
        return { year, value: rawValue * scale, rank, count: values.size };
      });
    const saved = r.items.find((item) => item.country === country)!;
    const atSnapshot = points.find((point) => point.year === r.year);
    const revised = !!atSnapshot && Math.abs(atSnapshot.value - saved.value) > Math.max(Math.abs(saved.value) * 0.005, 10 ** -r.decimals);
    return { points, source: url.toString(), revised };
  }
  return null;
}

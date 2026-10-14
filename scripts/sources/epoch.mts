import { parseCsv } from "../lib/csv.mts";
import { getText } from "../lib/http.mts";
import type { Ctx, Fetched, Item, Source } from "../lib/types.mts";

/**
 * Epoch AI "GPU Clusters" dataset: the AI supercomputers / AI data centers Epoch has found in public sources
 * (company announcements, filings, TOP500, satellite imagery…). CC BY 4.0. It is a hand-built census, not a full
 * count of data centers: clusters of private firms and of China are the least visible, so totals are lower bounds.
 */
const URL = "https://epoch.ai/data/gpu_clusters.csv";
const PAGE = "https://epoch.ai/data/gpu-clusters";

const num = (v: string | undefined) => {
  const n = Number(v);
  return v !== undefined && v !== "" && Number.isFinite(n) ? n : 0;
};

const countryName = (s: string) => s.replace(/\s*\(the\)$/i, "").trim();

async function load(): Promise<{ rows: Record<string, string>[]; year: number; asOf: string; source: Source }> {
  const rows = parseCsv(await getText(URL)).filter((r) => r["Status"] === "Existing" && r["Exclude"] === "" && !r["Superseded by"] && r["Name"]);
  // Expansions are listed as new rows ("Phase 2" builds on "Phase 1"); superseded rows are dropped so they are not counted twice.
  if (rows.length < 100 || !("H100 equivalents" in rows[0]) || !("Country" in rows[0])) throw new Error("Epoch GPU clusters CSV has an unexpected layout");
  const latest = rows.map((r) => r["First Operational Date"]).filter((d) => /^\d{4}-\d{2}/.test(d)).sort().at(-1)!;
  return {
    rows,
    year: +latest.slice(0, 4),
    asOf: latest.slice(0, 7),
    source: { kind: "csv", name: "Epoch AI, GPU Clusters", url: PAGE, license: "CC BY 4.0 (Epoch AI)" },
  };
}

/** AI clusters per country: how many exist, their combined compute (H100 equivalents) or their combined power draw (MW). */
export function epochByCountry(measure: "count" | "h100e" | "power", note: string) {
  return async ({ countries }: Ctx): Promise<Fetched> => {
    const { rows, year, asOf, source } = await load();
    const totals = new Map<string, { name: string; value: number }>();
    const unmatched = new Set<string>();
    for (const r of rows) {
      if (!r["Country"]) continue; // multi-site or undisclosed location
      const c = countries.byName(countryName(r["Country"]));
      if (!c) { unmatched.add(r["Country"]); continue; }
      const add = measure === "count" ? 1 : measure === "h100e" ? num(r["H100 equivalents"]) : num(r["Power Capacity (MW)"]);
      const t = totals.get(c.code) ?? { name: c.name, value: 0 };
      t.value += add;
      totals.set(c.code, t);
    }
    if (unmatched.size) console.warn(`  ! epoch: could not match ${[...unmatched].join(", ")}`);
    const items: Item[] = [...totals].filter(([, t]) => t.value > 0).map(([country, t]) => ({ name: t.name, country, value: measure === "power" ? Math.round(t.value * 10) / 10 : Math.round(t.value) }));
    return { year, asOf, source: { ...source, note }, items };
  };
}

/** The biggest single AI clusters, each with its owner. */
export function epochLargestClusters(limit: number) {
  return async ({ countries }: Ctx): Promise<Fetched> => {
    const { rows, year, asOf, source } = await load();
    const items: Item[] = [];
    for (const r of rows) {
      const c = countries.byName(countryName(r["Country"]));
      const value = num(r["H100 equivalents"]);
      if (!c || value <= 0) continue;
      items.push({ name: r["Name"].trim(), country: c.code, value: Math.round(value), ...(r["Owner"] ? { detail: r["Owner"].replace(/,/g, ", ") } : {}) });
    }
    // A few clusters share a generic name (e.g. several "Anonymized Chinese System"); ranking names must be unique.
    const seen = new Map<string, number>();
    for (const it of items.sort((a, b) => b.value - a.value)) {
      const n = (seen.get(it.name) ?? 0) + 1;
      seen.set(it.name, n);
      if (n > 1) it.name = `${it.name} #${n}`;
    }
    return { year, asOf, source: { ...source, note: "Operational clusters only. Compute is expressed in H100-equivalents; some clusters are estimates (Epoch marks them 'Likely')." }, items: items.slice(0, limit) };
  };
}

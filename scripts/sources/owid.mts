import { parseCsv } from "../lib/csv.mts";
import { getText } from "../lib/http.mts";
import type { Ctx, Fetched, Item, Source } from "../lib/types.mts";

/**
 * Our World in Data "grapher" chart as CSV (entity, code, year, <value>). OWID republishes data from Epoch AI,
 * Stanford's AI Index, CSET, etc. under CC BY. Like the World Bank adapter, it uses the single latest year that has
 * enough countries, so all rows are from the same year. `code` is ISO-3; OWID's aggregates ("OWID_WRL", regions) have none.
 */
export function owid(opts: { slug: string; name: string; column?: string; exclude?: string[]; scale?: number; minCountries?: number; note?: string; license?: string }) {
  const { slug, scale = 1, minCountries = 20 } = opts;
  return async ({ countries }: Ctx): Promise<Fetched> => {
    const rows = parseCsv(await getText(`https://ourworldindata.org/grapher/${slug}.csv?useColumnShortNames=true`));
    if (!rows.length) throw new Error(`OWID chart ${slug} came back empty`);
    const valueKey = opts.column ?? Object.keys(rows[0]).find((k) => !["entity", "code", "year", "day"].includes(k));
    if (!valueKey) throw new Error(`OWID chart ${slug} has no value column`);

    // Most charts are yearly; some (quarterly surveys) have a `day` column instead.
    const byYear = new Map<string, Item[]>();
    for (const r of rows) {
      const c = countries.byCode3.get(r.code);
      const value = Number(r[valueKey]);
      if (!c || opts.exclude?.includes(c.code) || r[valueKey] === "" || !Number.isFinite(value)) continue;
      const when = r.year ?? r.day;
      const list = byYear.get(when) ?? [];
      list.push({ name: c.name, country: c.code, value: value * scale });
      byYear.set(when, list);
    }
    const latest = [...byYear.keys()].sort().reverse().find((y) => byYear.get(y)!.length >= minCountries);
    if (!latest) throw new Error(`No year of ${slug} has ≥${minCountries} countries`);

    const source: Source = {
      kind: "csv",
      name: opts.name,
      url: `https://ourworldindata.org/grapher/${slug}`,
      license: opts.license ?? "CC BY 4.0 (Our World in Data)",
      ...(opts.note ? { note: opts.note } : {}),
    };
    return { year: +latest.slice(0, 4), ...(latest.length > 4 ? { asOf: latest.slice(0, 7) } : {}), source, items: byYear.get(latest)! };
  };
}

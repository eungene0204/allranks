import { getJson } from "../lib/http.mts";
import type { Ctx, Fetched, Item } from "../lib/types.mts";

type Row = { indicator: { value: string }; countryiso3code: string; date: string; value: number | null };

/** The newest year with at least this many countries is shown, however many older years are fuller. */
export const MIN_COUNTRIES_FOR_LATEST = 10;

/**
 * World Bank Open Data indicator. Uses the single most recent year that has enough countries, so every
 * row of the ranking is from the same year (the API's "latest value" would mix years).
 */
export function worldBank(opts: { indicator: string; scale?: number; minCountries?: number; fromYear?: number }) {
  const { indicator, scale = 1, fromYear } = opts;
  const minCountries = MIN_COUNTRIES_FOR_LATEST; // newest year wins; a per-ranking `minCountries` no longer raises the bar
  return async ({ countries }: Ctx): Promise<Fetched> => {
    const now = new Date().getFullYear();
    const url = `https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json&per_page=20000&date=${Math.min(now - 6, fromYear ?? now - 6)}:${now}`;
    const [meta, rows] = await getJson<[{ pages: number }, Row[] | null]>(url);
    if (!rows) throw new Error(`World Bank returned no rows for ${indicator}`);
    if (meta.pages > 1) throw new Error(`World Bank response was paginated (${meta.pages} pages); raise per_page`);

    const byYear = new Map<number, Item[]>();
    for (const r of rows) {
      const c = countries.byCode3.get(r.countryiso3code); // aggregates ("World", "EU", …) aren't countries
      if (!c || r.value == null) continue;
      const list = byYear.get(+r.date) ?? [];
      list.push({ name: c.name, country: c.code, value: r.value * scale });
      byYear.set(+r.date, list);
    }
    const year = [...byYear.keys()].sort((a, b) => b - a).find((y) => byYear.get(y)!.length >= minCountries);
    if (!year) throw new Error(`No year of ${indicator} has ≥${minCountries} countries`);

    return {
      year,
      source: {
        kind: "api",
        name: `World Bank Open Data — ${rows[0].indicator.value}`,
        url: `https://data.worldbank.org/indicator/${indicator}`,
        license: "CC BY 4.0",
      },
      items: byYear.get(year)!,
    };
  };
}

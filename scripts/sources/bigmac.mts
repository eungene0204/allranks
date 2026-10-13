import { getText } from "../lib/http.mts";
import { parseCsv } from "../lib/csv.mts";
import type { Ctx, Fetched, Item } from "../lib/types.mts";

const URL_ = "https://raw.githubusercontent.com/TheEconomist/big-mac-data/master/output-data/big-mac-full-index.csv";

/** The Economist's Big Mac Index (open data on GitHub): latest survey date, price in USD. */
export async function bigMac({ countries }: Ctx): Promise<Fetched> {
  const rows = parseCsv(await getText(URL_));
  const latest = rows.map((r) => r.date).sort().at(-1)!;
  const items: Item[] = [];
  for (const r of rows.filter((x) => x.date === latest)) {
    const c = countries.byCode3.get(r.iso_a3); // skips the euro-area aggregate "EUZ"
    const value = Number(r.dollar_price);
    if (c && Number.isFinite(value) && value > 0) items.push({ name: c.name, country: c.code, value });
  }
  return {
    year: +latest.slice(0, 4),
    asOf: latest.slice(0, 7),
    source: {
      kind: "csv",
      name: "The Economist — Big Mac Index",
      url: "https://github.com/TheEconomist/big-mac-data",
      license: "CC BY 4.0",
    },
    items,
  };
}

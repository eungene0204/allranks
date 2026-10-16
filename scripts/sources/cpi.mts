import { parseCsv } from "../lib/csv.mts";
import { getText } from "../lib/http.mts";
import type { Ctx, Fetched, Item } from "../lib/types.mts";

// Machine-readable mirror of Transparency International's official workbook. The mirror documents its provenance
// and preserves the publisher's scores without recalculation.
const INDEX = "https://nationsinquiry.com/datasets/corruption-perceptions-index";

export async function corruptionPerceptions({ countries }: Ctx): Promise<Fetched> {
  const page = await getText(INDEX);
  const editions = [...page.matchAll(/\/datasets\/corruption-perceptions-index\/(\d{4})/g)]
    .map((m) => Number(m[1])).filter((year) => year >= 2025);
  const year = Math.max(...editions);
  if (!Number.isFinite(year)) throw new Error("CPI dataset index has no edition from 2025 onward");
  const url = `${INDEX}/${year}/data.csv`;
  const csv = await getText(url);
  const headerAt = csv.indexOf("global_rank,country,country_code,cpi_score,");
  if (headerAt < 0) throw new Error("CPI CSV data header changed");
  const rows = parseCsv(csv.slice(headerAt));
  const items: Item[] = [];
  for (const r of rows) {
    // Kosovo uses XKX in this dataset, while the country reference file has a nonstandard UNK code.
    const c = countries.byCode3.get(r.country_code) ?? countries.byName(r.country);
    const value = Number(r.cpi_score);
    if (c && Number.isFinite(value) && r.global_rank) items.push({ name: c.name, country: c.code, value });
  }
  return {
    year,
    source: {
      kind: "csv",
      name: "Transparency International, Corruption Perceptions Index 2025 (via Nations Inquiry CSV)",
      url,
      license: "CC BY 4.0 (data); attribution to Transparency International",
      note: `Official TI ${year} scores reproduced in a machine-readable CSV mirror; 0 = highly corrupt perception, 100 = very clean perception.`,
    },
    items,
  };
}

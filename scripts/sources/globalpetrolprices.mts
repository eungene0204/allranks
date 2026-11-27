import { getText } from "../lib/http.mts";
import type { Ctx, Fetched, Item } from "../lib/types.mts";

const PAGE = "https://www.globalpetrolprices.com/gasoline_prices/";

/**
 * GlobalPetrolPrices "gasoline prices, Octane-95" bar chart. The page is a hand-drawn HTML chart: country links
 * and bar labels appear in the same order (cheapest first), so the i-th name pairs with the i-th value.
 */
export async function gasoline({ countries }: Ctx): Promise<Fetched> {
  const html = await getText(PAGE);
  const names = [...html.matchAll(/class='graph_outside_link'>([^<]+)</g)].map((m) => m[1].replace(/&nbsp;|\u00a0/g, " ").replace(/&amp;/g, "&").replace(/\*$/, "").trim());
  const values = [...html.matchAll(/<div style="position: absolute; top: 2px; left: 7px; height: 15px; color: #000000;">([\d.]+)<\/div>/g)].map((m) => Number(m[1]));
  if (names.length < 100 || names.length !== values.length) throw new Error(`layout changed: ${names.length} names vs ${values.length} values`);
  if (values.some((v, i) => i && v < values[i - 1])) throw new Error("values are not ascending — name/value pairing is unsafe");

  const date = html.match(/Gasoline prices, liter,\s*(\d{1,2})-([A-Z][a-z]{2})-(\d{4})/);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = date ? months.indexOf(date[2]) + 1 : 0;
  if (!date || !month) throw new Error("Missing gasoline price reference date");
  const asOf = `${date[3]}-${String(month).padStart(2, "0")}`;
  const snapshotDate = `${asOf}-${date[1].padStart(2, "0")}`;
  const alias: Record<string, string> = { USA: "US", UK: "GB", UAE: "AE", "Burma (Myanmar)": "MM", Swaziland: "SZ", "Ivory Coast": "CI", "Cape Verde": "CV", "DR Congo": "CD", "Czech Republic": "CZ", "Dom. Rep.": "DO", "N. Maced.": "MK", "C. Afr. Rep.": "CF", "Bosnia & Herz.": "BA", "Trinidad & Tobago": "TT", Curacao: "CW" };
  const items: Item[] = [];
  names.forEach((n, i) => {
    const c = (alias[n] && countries.byCode2.get(alias[n])) || countries.byName(n);
    if (c && c.independent && values[i] > 0) items.push({ name: c.name, country: c.code, value: values[i] });
  });
  return {
    year: Number(date[3]),
    asOf,
    source: { kind: "api", name: "GlobalPetrolPrices.com — Gasoline prices (Octane-95), USD per liter", url: PAGE, note: `Publisher snapshot dated ${snapshotDate}. Pump prices converted to USD at the publisher's current exchange rates; territories are left out.` },
    items,
  };
}

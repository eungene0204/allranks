import { getJson } from "../lib/http.mts";
import type { Fetched, Item } from "../lib/types.mts";

const REPORT = "https://www.equilar.com/reports/129-equilar-new-york-times-top-100-highest-paid-ceos-2026.html";
const TABLE = "https://www.equilar.com/reports/129-table-equilar-new-york-times-top-100-highest-paid-ceos-2026.html";
const API = "https://www.equilar.com/wp-json/api/report/eq-100-2026-nyt";

/** The publisher's interactive table loads this JSON endpoint; columns are CEO, company, compensation, then other metrics. */
export async function equilarCeoPay(): Promise<Fetched> {
  const rows = await getJson<unknown>(API);
  if (!Array.isArray(rows) || rows.length !== 100) throw new Error("Equilar: expected exactly 100 CEOs");
  const items: Item[] = rows.map((row, i) => {
    if (!Array.isArray(row) || row.length !== 7 || row.some((v) => typeof v !== "string"))
      throw new Error(`Equilar row ${i + 1}: unexpected columns`);
    const [name, company, pay] = row as string[];
    if (!name.trim() || !company.trim() || !/^\$\d{1,3}(,\d{3})*$/.test(pay))
      throw new Error(`Equilar row ${i + 1}: missing name/company or invalid compensation`);
    const value = Number(pay.replace(/[$,]/g, ""));
    if (!Number.isSafeInteger(value) || value <= 0) throw new Error(`Equilar row ${i + 1}: invalid dollar amount`);
    return { name: name.trim(), country: "US", value, detail: company.trim() };
  });
  if (items.some((item, i) => i > 0 && item.value > items[i - 1].value))
    throw new Error("Equilar: compensation is no longer in descending order");
  return {
    year: 2025,
    source: {
      kind: "api",
      name: "Equilar / The New York Times — 100 Highest-Paid CEOs (2026 edition)",
      url: REPORT,
      urls: [TABLE, API],
      note: "Published June 5, 2026; fiscal 2025 awarded compensation, not realized take-home pay. Includes salary, cash bonuses, stock and options at grant-date value, benefits and perks; excludes pension-value changes and above-market deferred-compensation earnings. Covers U.S.-based or listed companies with revenue over $1 billion and proxy statements filed by April 30, 2026. US scope describes the study's company universe, not CEO nationality.",
    },
    items,
  };
}

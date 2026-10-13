import { getJson } from "../lib/http.mts";
import type { Ctx, Fetched, Item } from "../lib/types.mts";

const PAGE = "List_of_countries_by_Internet_connection_speeds";
const API = `https://en.wikipedia.org/w/api.php?action=parse&page=${PAGE}&prop=wikitext&format=json&formatversion=2`;

let cached: Promise<string> | undefined;
const wikitext = () => (cached ??= getJson<{ parse: { wikitext: string } }>(API).then((j) => j.parse.wikitext));

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Country cell → name: {{flagcountry|X}}, {{flag|X}} or [[X]] / [[X|label]]. */
const cellName = (cell: string) =>
  cell.match(/\{\{\s*flag(?:country|icon)?\s*\|\s*([^|}]+)/i)?.[1].trim() ?? cell.match(/\[\[([^\]|]+)/)?.[1].trim();

/**
 * Ookla Speedtest Global Index figures as tabulated (CC BY-SA) on Wikipedia — a stable, parseable mirror,
 * because Ookla itself offers no free country-level API. `section` is the page heading.
 */
export function wikipediaSpeed(section: "Fixed broadband" | "Mobile connection") {
  return async ({ countries }: Ctx): Promise<Fetched> => {
    const text = await wikitext();
    const start = text.indexOf(`== ${section} ==`);
    if (start < 0) throw new Error(`Section "${section}" not found — the Wikipedia page layout changed`);
    const rest = text.slice(start + 1);
    const body = text.slice(start, start + 1 + (rest.search(/\n== /) < 0 ? rest.length : rest.search(/\n== /)));

    const period = body.match(new RegExp(`(${MONTHS.join("|")}) (\\d{4})`));
    if (!period) throw new Error("Could not find the data month in the section intro");
    const asOf = `${period[2]}-${String(MONTHS.indexOf(period[1]) + 1).padStart(2, "0")}`;

    const items: Item[] = [];
    const unmatched: string[] = [];
    for (const chunk of body.split(/\n\|-\s*/).slice(1)) {
      // First cell: country; second cell: median download (Mbit/s).
      const flat = chunk.replace(/\n/g, " ");
      const m = flat.match(/\|\s*(?:style="[^"]*"\s*\|\s*)?(.+?)\s*\|\|\s*([\d,]+(?:\.\d+)?)/);
      if (!m) continue;
      const name = cellName(m[1]);
      const value = Number(m[2].replace(/,/g, ""));
      if (!name || !Number.isFinite(value)) continue;
      const c = countries.byName(name);
      if (c) items.push({ name: c.name, country: c.code, value });
      else unmatched.push(name);
    }
    if (unmatched.length) console.warn(`  ! ${section}: could not match ${unmatched.length} name(s): ${unmatched.join(", ")}`);
    return {
      year: +period[2],
      asOf,
      source: {
        kind: "wikipedia",
        name: "Ookla Speedtest Global Index (via Wikipedia)",
        url: `https://en.wikipedia.org/wiki/${PAGE}`,
        license: "CC BY-SA 4.0 (Wikipedia); underlying data © Ookla",
      },
      items,
    };
  };
}

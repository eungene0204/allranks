import { getText } from "../lib/http.mts";
import type { Ctx, Fetched, Item } from "../lib/types.mts";

const INDEX = "https://rsf.org/en/index";
const CSV_RE = /(?:https:\/\/rsf\.org)?(\/sites\/default\/files\/import_classement\/(\d{4})\.csv)/g;

/** Reporter Without Borders' annual country scores; discover the current edition from its official index page. */
export async function rsfPressFreedom({ countries }: Ctx): Promise<Fetched> {
  const page = await getText(INDEX);
  const editions = [...page.matchAll(CSV_RE)].map((m) => ({ path: m[1], year: Number(m[2]) }));
  const latest = editions.filter((e) => e.year >= 2025).sort((a, b) => b.year - a.year)[0];
  if (!latest) throw new Error("RSF index page has no downloadable edition from 2025 onward");

  const url = `https://rsf.org${latest.path}`;
  const lines = (await getText(url)).replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const header = lines.shift()?.split(";") ?? [];
  const isoAt = header.indexOf("ISO");
  const scoreAt = header.indexOf(`Score ${latest.year}`);
  const yearAt = header.indexOf("Year (N)");
  if (isoAt < 0 || scoreAt < 0 || yearAt < 0) throw new Error("RSF CSV headers changed");

  const items: Item[] = [];
  for (const line of lines) {
    const row = line.split(";");
    const c = countries.byCode3.get(row[isoAt]);
    const value = Number(row[scoreAt]?.replace(",", "."));
    if (c && Number(row[yearAt]) === latest.year && Number.isFinite(value)) items.push({ name: c.name, country: c.code, value });
  }
  return {
    year: latest.year,
    source: {
      kind: "csv",
      name: "Reporters Without Borders (RSF), World Press Freedom Index",
      url: INDEX,
      license: "RSF copyright; source attribution required",
      note: `Official ${latest.year} index download; higher score means greater press freedom.`,
    },
    items,
  };
}

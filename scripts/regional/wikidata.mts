import { loadCountries } from "../lib/countries.mts";
import { rank } from "./lib.mts";
import type { Fetched, Item, Pipeline } from "../lib/types.mts";

// Population of a country's first-level administrative divisions from Wikidata (CC0), for countries whose
// Wikipedia articles have no usable table. Each division can carry several population statements; the one with
// the latest "point in time" wins, and the year goes into the row's detail so stale figures stay visible.

const ENDPOINT = "https://query.wikidata.org/sparql";
const countries = loadCountries();

/** Minimum number of divisions Wikidata must return, otherwise the ranking is not worth a tab. */
const MIN = 5;
const GAP_MS = 1500;
let last = 0;

type Binding = { i: { value: string }; l: { value: string }; pop: { value: string }; t?: { value: string } };

async function sparql(query: string): Promise<Binding[]> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const wait = last + GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    last = Date.now();
    try {
      const res = await fetch(`${ENDPOINT}?query=${encodeURIComponent(query)}`, {
        headers: { accept: "application/sparql-results+json", "user-agent": "allranks-data-pipeline/0.1 (open ranking site; Wikidata SPARQL)" },
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return ((await res.json()) as { results: { bindings: Binding[] } }).results.bindings;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  throw new Error(`Wikidata query failed: ${(lastErr as Error).message}`);
}

/** "Ségou Region" → "Ségou"; the division type is the same for every row, so it only adds noise. */
const tidy = (s: string) => s.replace(/ (Region|Province|District|Department|County|Prefecture|Governorate|State|Division)$/, "").trim();

function fetchFor(cc: string) {
  return async (): Promise<Fetched> => {
    const rows = await sparql(`SELECT ?i ?l ?pop ?t WHERE {
      ?c wdt:P297 "${cc}". ?i wdt:P17 ?c; wdt:P31/wdt:P279* wd:Q10864048; p:P1082 ?s. ?s ps:P1082 ?pop.
      OPTIONAL { ?s pq:P585 ?t }
      FILTER NOT EXISTS { ?i wdt:P576 [] }
      ?i rdfs:label ?l FILTER(LANG(?l) = "en") }`);
    const best = new Map<string, { name: string; pop: number; year: number }>();
    for (const r of rows) {
      const pop = Number(r.pop.value);
      const year = r.t ? new Date(r.t.value).getUTCFullYear() : 0;
      const cur = best.get(r.i.value);
      if (pop > 0 && (!cur || year > cur.year)) best.set(r.i.value, { name: tidy(r.l.value), pop, year });
    }
    const seen = new Set<string>();
    const items: Item[] = [...best.values()]
      .filter((b) => !seen.has(b.name) && seen.add(b.name))
      .sort((a, b) => b.pop - a.pop)
      .map((b) => ({ name: b.name, country: cc, value: b.pop, ...(b.year ? { detail: String(b.year) } : {}) }));
    if (items.length < MIN) throw new Error(`only ${items.length} divisions for ${cc}`);
    return {
      year: Math.max(...[...best.values()].map((b) => b.year), 0) || new Date().getFullYear(),
      source: {
        kind: "api",
        name: "Wikidata, population of first-level administrative divisions",
        url: "https://www.wikidata.org/",
        license: "CC0 1.0 (Wikidata)",
        note: "Latest dated population statement per division; the year is shown on each row and differs between divisions.",
      },
      items,
    };
  };
}

/** A "regions by population" ranking for each given country code. */
export function regionPopulation(codes: string[]): Pipeline[] {
  return codes.map((cc) => {
    const name = countries.byCode2.get(cc)?.name ?? cc;
    return rank(
      cc,
      "region-population",
      {
        kind: "population",
        title: `${name} Regions by Population`,
        desc: `First-level administrative divisions of ${name} ranked by population (Wikidata).`,
        unit: "people",
      },
      fetchFor(cc),
    );
  });
}

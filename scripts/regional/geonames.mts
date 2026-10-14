import { inflateRawSync } from "node:zlib";
import { getText } from "../lib/http.mts";
import { loadCountries } from "../lib/countries.mts";
import { rank } from "./lib.mts";
import type { Fetched, Item, Pipeline } from "../lib/types.mts";

// "Largest cities" for any country from GeoNames (CC BY 4.0): the cities15000 dump lists every place with
// more than 15,000 people worldwide, tab-separated. One download feeds every country; it is cached per run.
// Populations are GeoNames' own aggregate of census and estimate figures, so the vintage differs by city.

const DUMP = "https://download.geonames.org/export/dump";
const countries = loadCountries();

/** Minimum number of cities GeoNames must know, otherwise the ranking is not worth a tab. */
const MIN = 5;
const LIMIT = 50;

type Row = { name: string; cc: string; admin1: string; pop: number; date: string };

/** Contents of the single file in a zip archive (central directory first: local headers may omit sizes). */
function unzipOnly(buf: Buffer): string {
  let e = buf.length - 22;
  while (e >= 0 && buf.readUInt32LE(e) !== 0x06054b50) e--;
  if (e < 0) throw new Error("not a zip file");
  const cd = buf.readUInt32LE(e + 16);
  const method = buf.readUInt16LE(cd + 10);
  const size = buf.readUInt32LE(cd + 20);
  const local = buf.readUInt32LE(cd + 42);
  const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
  const data = buf.subarray(start, start + size);
  if (method !== 8) throw new Error(`unsupported zip method ${method}`);
  return inflateRawSync(data).toString("utf8");
}

let cache: Promise<{ rows: Map<string, Row[]>; admin1: Map<string, string> }> | undefined;
function load() {
  cache ??= (async () => {
    const res = await fetch(`${DUMP}/cities15000.zip`, { headers: { "user-agent": "allranks-data-pipeline/0.1" }, signal: AbortSignal.timeout(120_000) });
    if (!res.ok) throw new Error(`GET cities15000.zip failed: HTTP ${res.status}`);
    const text = unzipOnly(Buffer.from(await res.arrayBuffer()));
    const rows = new Map<string, Row[]>();
    for (const line of text.split("\n")) {
      const c = line.split("\t");
      if (c.length < 19) continue;
      const pop = Number(c[14]);
      if (!(pop > 0)) continue;
      const list = rows.get(c[8]) ?? [];
      list.push({ name: c[1], cc: c[8], admin1: c[10], pop, date: c[18] });
      rows.set(c[8], list);
    }
    const admin1 = new Map<string, string>();
    for (const line of (await getText(`${DUMP}/admin1CodesASCII.txt`)).split("\n")) {
      const c = line.split("\t");
      if (c.length >= 2) admin1.set(c[0], c[1]);
    }
    return { rows, admin1 };
  })();
  return cache;
}

function fetchFor(cc: string) {
  return async (): Promise<Fetched> => {
    const { rows, admin1 } = await load();
    const top = [...(rows.get(cc) ?? [])].sort((a, b) => b.pop - a.pop).slice(0, LIMIT);
    if (top.length < MIN) throw new Error(`only ${top.length} cities for ${cc}`);
    const seen = new Map<string, number>();
    const items: Item[] = top.map((r) => {
      const region = admin1.get(`${cc}.${r.admin1}`);
      const n = (seen.get(r.name) ?? 0) + 1;
      seen.set(r.name, n);
      return { name: n === 1 ? r.name : `${r.name} (${region ?? n})`, country: cc, value: r.pop, ...(region ? { detail: region } : {}) };
    });
    return {
      year: new Date().getFullYear(),
      source: {
        kind: "csv",
        name: "GeoNames, cities with more than 15,000 inhabitants",
        url: "https://www.geonames.org/",
        license: "CC BY 4.0 (GeoNames)",
        note: "GeoNames aggregates census and estimate figures, so the reference year varies by city, and a few figures cover the metropolitan area rather than the city proper.",
      },
      items,
    };
  };
}

/** A "largest cities" ranking for each given country code. */
export function largestCities(codes: string[]): Pipeline[] {
  return codes.map((cc) => {
    const name = countries.byCode2.get(cc)?.name ?? cc;
    return rank(
      cc,
      "cities",
      { kind: "cities", title: `Largest Cities in ${name}`, desc: `Cities of ${name} with more than 15,000 inhabitants, ranked by population (GeoNames).`, unit: "people" },
      fetchFor(cc),
    );
  });
}

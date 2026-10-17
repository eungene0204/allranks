import { getText } from "../lib/http.mts";
import { parseCsv } from "../lib/csv.mts";
import { loadCountries } from "../lib/countries.mts";
import { rank } from "./lib.mts";
import type { Fetched, Pipeline } from "../lib/types.mts";

// OurAirports publishes nightly public-domain CSVs for airports and runways worldwide.
const BASE = "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main";
const LICENSE = "Public domain (OurAirports)";
const countries = loadCountries();
const AIRPORT_TYPES = new Set(["small_airport", "medium_airport", "large_airport"]);

type Airport = { id: string; name: string; country: string; type: string; elevation: number; municipality: string };
type Runway = { airport: string; lengthFt: number; surface: string; closed: boolean };
let cache: Promise<{ airports: Map<string, Airport[]>; runways: Map<string, Runway[]> }> | undefined;

function load() {
  cache ??= (async () => {
    const [airportCsv, runwayCsv] = await Promise.all([
      getText(`${BASE}/airports.csv`),
      getText(`${BASE}/runways.csv`),
    ]);
    const airports = new Map<string, Airport[]>();
    for (const row of parseCsv(airportCsv)) {
      if (!AIRPORT_TYPES.has(row.type) || !row.iso_country || !row.name) continue;
      const item = {
        id: row.id, name: row.name, country: row.iso_country, type: row.type,
        elevation: Number(row.elevation_ft), municipality: row.municipality,
      };
      const list = airports.get(item.country) ?? [];
      list.push(item);
      airports.set(item.country, list);
    }
    const runways = new Map<string, Runway[]>();
    for (const row of parseCsv(runwayCsv)) {
      const item = { airport: row.airport_ref, lengthFt: Number(row.length_ft), surface: row.surface, closed: row.closed === "1" };
      if (!item.airport || !Number.isFinite(item.lengthFt) || item.lengthFt <= 0 || item.closed) continue;
      const list = runways.get(item.airport) ?? [];
      list.push(item);
      runways.set(item.airport, list);
    }
    return { airports, runways };
  })();
  return cache;
}

function airportRanking(cc: string, metric: "elevation" | "runway"): Pipeline {
  const name = countries.byCode2.get(cc)?.name ?? cc;
  const byRunway = metric === "runway";
  return rank(
    cc,
    byRunway ? "longest-runways" : "airports-by-elevation",
    {
      kind: "airports", short: byRunway ? "Runway length" : "Airport elevation", category: "world", sort: byRunway ? 9 : 10,
      title: byRunway ? `Longest Airport Runways in ${name}` : `Highest Airports in ${name}`,
      desc: byRunway
        ? `Airports in ${name} ranked by the length of their longest open runway.`
        : `Airports in ${name} ranked by elevation above sea level.`,
      unit: "metres", suffix: " m",
    },
    async (): Promise<Fetched> => {
      const data = await load();
      const local = data.airports.get(cc) ?? [];
      const candidates = (byRunway
        ? local.flatMap((airport) => {
            const longest = (data.runways.get(airport.id) ?? []).sort((a, b) => b.lengthFt - a.lengthFt)[0];
            if (!longest) return [];
            return [{
              name: airport.name, identity: airport.id, country: cc, value: longest.lengthFt * 0.3048,
              detail: [airport.municipality, `${longest.lengthFt.toLocaleString("en-US")} ft`, longest.surface].filter(Boolean).join(" · "),
            }];
          })
        : local.filter((airport) => Number.isFinite(airport.elevation) && airport.elevation > 0).map((airport) => ({
            name: airport.name, identity: airport.id, country: cc, value: airport.elevation * 0.3048,
            detail: [airport.municipality, `${airport.elevation.toLocaleString("en-US")} ft above sea level`].filter(Boolean).join(" · "),
          })).sort((a, b) => b.value - a.value).slice(0, 50)).sort((a, b) => b.value - a.value).slice(0, 50);
      const seen = new Set<string>();
      const items = candidates.map(({ identity, ...item }) => {
        let name = item.name;
        if (seen.has(name)) name = `${item.name} (${item.detail?.split(" · ")[0] || identity})`;
        if (seen.has(name)) name = `${name} (${identity})`;
        seen.add(name);
        return { ...item, name };
      });
      if (items.length < 5) throw new Error(`only ${items.length} airports for ${cc}`);
      return {
        year: new Date().getFullYear(),
        source: {
          kind: "csv",
          name: "OurAirports, airports and runway datasets",
          url: "https://ourairports.com/data/",
          license: LICENSE,
          note: "Airport and runway records are community maintained and released to the public domain; no guarantee of accuracy is made. Only active small, medium, and large airports are included.",
        },
        items,
      };
    },
  );
}

/** Two open-data measures for countries with at least five matching airport records. */
export function airportMetrics(codes: string[]): Pipeline[] {
  return codes.flatMap((cc) => [airportRanking(cc, "elevation"), airportRanking(cc, "runway")]);
}

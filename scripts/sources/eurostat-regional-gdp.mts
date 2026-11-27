import { getJson } from "../lib/http.mts";
import type { Fetched } from "../lib/types.mts";

type Level = 2 | 3;
type Unit = "MIO_EUR" | "EUR_HAB";
type Category = { category: { index: Record<string, number> } };
type RegionalGdpResponse = {
  id: string[];
  size: number[];
  updated: string;
  dimension: { unit: Category; geo: Category; time: Category };
  value: Record<string, number>;
};

const datasets = new Map<Level, Promise<RegionalGdpResponse>>();

function loadRegionalGdp(level: Level) {
  const existing = datasets.get(level);
  if (existing) return existing;

  const dataset = `nama_10r_${level}gdp`;
  const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset}?lang=EN&unit=MIO_EUR&unit=EUR_HAB&lastTimePeriod=3`;
  const pending = getJson<RegionalGdpResponse>(url);
  datasets.set(level, pending);
  return pending;
}

export function eurostatRegionalGdp(
  country: string,
  level: Level,
  regions: Record<string, string>,
  unit: Unit,
) {
  return async (): Promise<Fetched> => {
    const data = await loadRegionalGdp(level);
    if (data.id.join(",") !== "freq,unit,geo,time" || data.size[0] !== 1) {
      throw new Error("Unexpected Eurostat regional GDP dimensions");
    }

    const unitIndex = data.dimension.unit.category.index[unit];
    const geoIndex = data.dimension.geo.category.index;
    const timeIndex = data.dimension.time.category.index;
    const [, , geoCount, timeCount] = data.size;
    const entries = Object.entries(regions);
    if (unitIndex === undefined || entries.some(([code]) => geoIndex[code] === undefined)) {
      throw new Error(`Eurostat NUTS ${level} does not contain the requested unit or all ${country} region codes`);
    }

    const valueAt = (code: string, period: string) =>
      data.value[((unitIndex * geoCount + geoIndex[code]) * timeCount) + timeIndex[period]];
    const years = Object.keys(timeIndex).sort((a, b) => Number(b) - Number(a));
    const period = years.find((year) => entries.every(([code]) => Number.isFinite(valueAt(code, year))));
    if (!period) throw new Error(`Eurostat has no complete NUTS ${level} GDP year for ${country}`);

    const dataset = `nama_10r_${level}gdp`;
    const scale = unit === "MIO_EUR" ? 1 / 1000 : 1;
    return {
      year: Number(period),
      source: {
        kind: "api",
        name: `Eurostat, regional accounts (NUTS ${level})`,
        url: `https://ec.europa.eu/eurostat/databrowser/view/${dataset}/default/table?lang=en`,
        license: "Eurostat reuse with attribution",
        note: `Current market prices, ${entries.length} NUTS ${level} regions. Uses the latest year with data for every listed region. Eurostat table updated ${data.updated.slice(0, 10)}. Figures may be revised.`,
      },
      items: entries.map(([code, name]) => ({ name, country, value: valueAt(code, period) * scale })),
    };
  };
}

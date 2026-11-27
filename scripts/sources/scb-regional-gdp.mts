import { getJson } from "../lib/http.mts";
import type { Fetched } from "../lib/types.mts";

const TABLE = "https://www.statistikdatabasen.scb.se/pxweb/en/ssd/START__NR__NR0105__NR0105A/NR0105ENS2010T01A/";
const API = "https://statistikdatabasen.scb.se/api/v2/tables/TAB3138/data";
const COUNTY_CODES = "01,03,04,05,06,07,08,09,10,12,13,14,17,18,19,20,21,22,23,24,25".split(",");
const UNITS = { NR0105AH: { base: "million SEK", scale: 0.001 }, NR0105AJ: { base: "thousand SEK", scale: 1000 } };

type Measure = keyof typeof UNITS;
type Category = { category: { index: Record<string, number>; label: Record<string, string> } };
type RegionalGdpResponse = {
  id: string[];
  size: number[];
  updated: string;
  dimension: {
    Region: Category;
    ContentsCode: Category & { category: { unit: Record<Measure, { base: string }> } };
    Tid: Category;
  };
  value: (number | null)[];
};

let regionalGdp: Promise<RegionalGdpResponse> | undefined;

export function scbRegionalGdp(measure: Measure) {
  return async (): Promise<Fetched> => {
    const params = new URLSearchParams({
      lang: "en",
      "valueCodes[Region]": COUNTY_CODES.join(","),
      "valueCodes[ContentsCode]": Object.keys(UNITS).join(","),
      "valueCodes[Tid]": "top(1)",
    });
    const data = await (regionalGdp ??= getJson<RegionalGdpResponse>(`${API}?${params}`));
    if (data.id.join(",") !== "Region,ContentsCode,Tid" || data.size.join(",") !== "21,2,1") {
      throw new Error("Unexpected Statistics Sweden regional GDP dimensions");
    }
    const { Region, ContentsCode, Tid } = data.dimension;
    const year = Number(Object.keys(Tid.category.index)[0]);
    const unit = UNITS[measure];
    if (!year || ContentsCode.category.unit[measure].base !== unit.base) {
      throw new Error("Unexpected Statistics Sweden regional GDP year or unit");
    }

    return {
      year,
      source: {
        kind: "api",
        name: "Statistics Sweden, regional accounts (TAB3138)",
        url: TABLE,
        license: "CC0 1.0",
        note: `Current prices for all 21 counties. Statistics Sweden table updated ${data.updated.slice(0, 10)}. GDP per resident can be affected by commuting.`,
      },
      items: COUNTY_CODES.map((code) => {
        const position = Region.category.index[code] * data.size[1] + ContentsCode.category.index[measure];
        const value = data.value[position];
        const name = Region.category.label[code];
        if (!name || typeof value !== "number" || !Number.isFinite(value)) {
          throw new Error(`Missing Statistics Sweden regional GDP for county ${code}`);
        }
        return { name: name.replace(/ county$/, ""), country: "SE", value: value * unit.scale };
      }),
    };
  };
}

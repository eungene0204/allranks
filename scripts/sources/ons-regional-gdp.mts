import { getText } from "../lib/http.mts";
import { findTable, parseNum, wikiTables } from "../lib/wikipedia.mts";
import type { Fetched } from "../lib/types.mts";

const BULLETIN = "https://www.ons.gov.uk/economy/grossdomesticproductgdp/bulletins/regionaleconomicactivitybygrossdomesticproductuk/latest";
const REGIONS = [
  "North East", "North West", "Yorkshire and The Humber", "East Midlands", "West Midlands",
  "East of England", "London", "South East", "South West", "Wales", "Scotland", "Northern Ireland",
];

let regionalGdp: ReturnType<typeof loadRegionalGdp> | undefined;

async function loadRegionalGdp() {
  const table = findTable(
    wikiTables(await getText(BULLETIN)),
    "summary of gross domestic product statistics for selected countries and regions",
    "gdp at current market prices (£ million)",
    "gdp per head at current market prices (£)",
  );
  const year = Number(table.caption.match(/, (\d{4})$/)?.[1]);
  if (!year) throw new Error("ONS regional GDP table reference year is missing");

  const header = table.rows[0];
  const totalColumn = header.indexOf("GDP at current market prices (£ million)");
  const perHeadColumn = header.indexOf("GDP per head at current market prices (£)");
  const rows = table.rows.slice(1);
  const regions = REGIONS.map((name) => {
    const matches = rows.filter(([label]) => label === name || (name === "East of England" && label === "East"));
    if (matches.length !== 1) throw new Error(`ONS regional GDP has ${matches.length} rows for ${name}`);
    const total = parseNum(matches[0][totalColumn]);
    const perHead = parseNum(matches[0][perHeadColumn]);
    if (!Number.isFinite(total) || !Number.isFinite(perHead)) throw new Error(`Missing ONS GDP for ${name}`);
    return { name, total: total / 1000, perHead };
  });

  return { year, regions };
}

export function onsRegionalGdp(measure: "total" | "perHead") {
  return async (): Promise<Fetched> => {
    const { year, regions } = await (regionalGdp ??= loadRegionalGdp());
    return {
      year,
      source: {
        kind: "api",
        name: "Office for National Statistics, UK regional GDP",
        url: BULLETIN,
        license: "Open Government Licence v3.0",
        note: "ONS Table 1, current market prices for all 12 ITL1 areas. The latest annual figures are subject to revision. GDP per head uses resident population and is affected by commuting.",
      },
      items: regions.map((region) => ({ name: region.name, country: "GB", value: region[measure] })),
    };
  };
}

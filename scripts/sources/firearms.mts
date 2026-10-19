import { getJson, getText } from "../lib/http.mts";
import type { Ctx, Fetched, Item, Source } from "../lib/types.mts";

const OAS_BASE = "https://www.oas.org/ios/indicatorsdetails.aspx?indicator=";

function htmlText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .trim();
}

/** Extract the OAS country grid, keeping only countries with actual 2024 observations. */
export const oasFirearmHomicides = (metric: "count" | "rate") => async ({ countries }: Ctx): Promise<Fetched> => {
  const indicator = metric === "count" ? 341 : 30;
  const url = `${OAS_BASE}${indicator}&lang=en`;
  const html = await getText(url);
  const table = html.match(/<table[^>]+id="[^"]*Country_Grid[^\"]*GridIndicator_ctl00"[^>]*>([\s\S]*?)<\/table>/i)?.[1];
  if (!table) throw new Error(`OAS country data table not found for indicator ${indicator}`);
  const items: Item[] = [];
  for (const row of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => htmlText(cell[1]));
    if (cells.length < 3 || cells[1] !== "2024") continue;
    const country = countries.byName(cells[0]);
    const value = Number(cells[2].replace(/,/g, ""));
    if (!country || !Number.isFinite(value)) continue;
    items.push({ name: country.name, country: country.code, value });
  }
  if (items.length < 20) throw new Error(`OAS 2024 firearm homicide data unexpectedly small (${items.length} countries)`);
  const source: Source = {
    kind: "api",
    name: "Organization of American States (OAS), Inter-American Security Observatory",
    url,
    note: metric === "count"
      ? "2024 country observations only; countries with older or missing reports are excluded. Member States report victims through the UN Crime Trends Survey. Includes intentional homicide victims attacked with firearms."
      : "2024 country observations only; countries with older or missing reports are excluded. Rate is reported firearm homicide victims per 100,000 inhabitants. Member States report data through the UN Crime Trends Survey.",
  };
  return { year: 2024, source, items };
};

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida",
  "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

type CdcRow = {
  year_and_quarter: string;
  time_period: string;
  cause_of_death: string;
  rate_type: string;
  unit: string;
  [key: string]: string;
};

/** CDC/NCHS provisional state-level firearm mortality, latest usable trailing 12-month period in 2025. */
export const cdcFirearmDeathRate = (rateType: "Age-adjusted" | "Crude") => async (): Promise<Fetched> => {
  const url = new URL("https://data.cdc.gov/resource/489q-934x.json");
  url.searchParams.set("$where", "year_and_quarter like '2025%' AND cause_of_death = 'Firearm-related injury' AND rate_type = '" + rateType + "' AND time_period = '12 months ending with quarter'");
  url.searchParams.set("$limit", "100");
  const rows = await getJson<CdcRow[]>(url.toString());
  const quarters = [...new Set(rows.map((row) => row.year_and_quarter))].sort().reverse();
  for (const quarter of quarters) {
    const row = rows.find((candidate) => candidate.year_and_quarter === quarter);
    if (!row) continue;
    const items = US_STATES.flatMap((name) => {
      const key = `rate_${name.toLowerCase().replace(/ /g, "_")}`;
      const value = Number(row[key]);
      return Number.isFinite(value) ? [{ name, country: "US", value }] : [];
    });
    if (items.length < 50) continue;
    const source: Source = {
      kind: "api",
      name: "U.S. National Center for Health Statistics (CDC/NCHS), provisional mortality estimates",
      url: "https://data.cdc.gov/d/489q-934x",
      license: "U.S. Government public domain",
      note: `${rateType} rate for the 12 months ending ${quarter}; provisional and subject to revision. Firearm-related deaths include homicide, suicide, accidents and other intents; this is not a firearm homicide-only rate.`,
    };
    const [year, q] = quarter.split(" Q");
    const quarterEndMonth = String(Number(q) * 3).padStart(2, "0");
    return { year: Number(year), asOf: `${year}-${quarterEndMonth}`, source, items };
  }
  throw new Error(`No complete CDC 2025 state firearm rate row found (${rateType})`);
};

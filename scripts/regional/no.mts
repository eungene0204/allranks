import { rank } from "./lib.mts";
import type { Fetched, Item, Pipeline, Source } from "../lib/types.mts";

// Norway — counties.

type SsbTable = {
  updated?: string;
  size: number[];
  dimension: { Region: { category: { index: Record<string, number> } } };
  value: (number | null)[];
};
type SsbMetadata = { variables: { code: string; values: string[] }[] };

const COUNTY_CODES = [
  ["30", "Viken"], ["03", "Oslo"], ["34", "Innlandet"], ["38", "Vestfold og Telemark"], ["42", "Agder"],
  ["11", "Rogaland"], ["46", "Vestland"], ["15", "Møre og Romsdal"], ["50", "Trøndelag"], ["18", "Nordland"],
  ["54", "Troms og Finnmark"],
] as const;

let accountsPromise: Promise<{ year: number; source: Source; gdp: Item[]; perCapita: Item[] }> | undefined;
const accounts = () => accountsPromise ??= (async () => {
  const metadata = async (table: string) => {
    const response = await fetch(`https://data.ssb.no/api/v0/en/table/${table}`, { signal: AbortSignal.timeout(60_000) });
    if (!response.ok) throw new Error(`Statistics Norway table ${table} metadata: HTTP ${response.status}`);
    return response.json() as Promise<SsbMetadata>;
  };
  const [gdpMetadata, populationMetadata] = await Promise.all([metadata("09391"), metadata("03037")]);
  const years = new Set(gdpMetadata.variables.find((v) => v.code === "Tid")?.values ?? []);
  const year = (populationMetadata.variables.find((v) => v.code === "Tid")?.values ?? [])
    .filter((y) => years.has(y))
    .sort((a, b) => Number(b) - Number(a))[0];
  if (!year) throw new Error("Statistics Norway has no shared year for regional accounts and population");

  const query = async (table: string, variables: { code: string; selection: { filter: string; values: string[] } }[]) => {
    const response = await fetch(`https://data.ssb.no/api/v0/en/table/${table}`, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "allranks-data-pipeline/0.1" },
      body: JSON.stringify({ query: variables, response: { format: "json-stat2" } }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) throw new Error(`Statistics Norway table ${table}: HTTP ${response.status}`);
    return response.json() as Promise<SsbTable>;
  };
  const [gdpTable, populationTable] = await Promise.all([
    query("09391", [
      { code: "Region", selection: { filter: "all", values: ["*"] } },
      { code: "ContentsCode", selection: { filter: "item", values: ["BNPB"] } },
      { code: "Tid", selection: { filter: "item", values: [year] } },
    ]),
    query("03037", [
      { code: "Region", selection: { filter: "all", values: ["*"] } },
      { code: "Alder", selection: { filter: "all", values: ["*"] } },
      { code: "Kjonn", selection: { filter: "all", values: ["*"] } },
      { code: "EkteskStatus", selection: { filter: "all", values: ["*"] } },
      { code: "ContentsCode", selection: { filter: "item", values: ["Personer1"] } },
      { code: "Tid", selection: { filter: "item", values: [year] } },
    ]),
  ]);

  const gdp: Item[] = [];
  const perCapita: Item[] = [];
  const [, ages, sexes, maritalStatuses] = populationTable.size;
  for (const [code, name] of COUNTY_CODES) {
    const gdpIndex = gdpTable.dimension.Region.category.index[code];
    const populationIndex = populationTable.dimension.Region.category.index[code];
    const valueInMillions = gdpTable.value[gdpIndex];
    if (valueInMillions == null || !Number.isFinite(valueInMillions)) throw new Error(`SSB has no ${year} GDP value for ${name}`);
    let population = 0;
    for (let age = 0; age < ages; age++) for (let sex = 0; sex < sexes; sex++) for (let marital = 0; marital < maritalStatuses; marital++) {
      const index = (((populationIndex * ages + age) * sexes + sex) * maritalStatuses + marital);
      population += Number(populationTable.value[index] ?? 0);
    }
    if (!population || !Number.isFinite(population)) throw new Error(`SSB has no ${year} population value for ${name}`);
    gdp.push({ name, country: "NO", value: valueInMillions / 1000 });
    perCapita.push({ name, country: "NO", value: valueInMillions * 1_000_000 / population });
  }

  return {
    year: Number(year),
    source: {
      kind: "api",
      name: "Statistics Norway (SSB), Regional Accounts",
      url: "https://www.ssb.no/en/nasjonalregnskap-og-konjunkturer/nasjonalregnskap/statistikk/fylkesfordelt-nasjonalregnskap",
      license: "Norwegian Licence for Open Government Data (NLOD) 2.0",
      note: `Latest shared year in SSB regional accounts (${year}); per capita is calculated using SSB mean population. ${gdpTable.updated ? `Source tables updated ${gdpTable.updated.slice(0, 10)}.` : ""}`.trim(),
    },
    gdp,
    perCapita,
  };
})();

const ssb = (select: "gdp" | "perCapita") => async (): Promise<Fetched> => {
  const data = await accounts();
  return { year: data.year, source: data.source, items: data[select] };
};

const rankings: Pipeline[] = [
  rank("NO", "county-gdp", {
    kind: "gdp", title: "Norwegian Counties by GDP",
    desc: "Regional value added at basic prices, in billions of Norwegian kroner.",
    unit: "NOK billion", suffix: " bn NOK", decimals: 0,
  }, ssb("gdp")),
  rank("NO", "county-gdp-per-capita", {
    kind: "gdp-pc", title: "Norwegian Counties by GDP per Capita",
    desc: "Regional value added per resident, in Norwegian kroner.",
    unit: "NOK per person", suffix: " NOK",
  }, ssb("perCapita")),
];
export default rankings;

import { getJson } from "../lib/http.mts";
import { loadCountries } from "../lib/countries.mts";
import { rank } from "./lib.mts";
import type { Fetched, Pipeline } from "../lib/types.mts";

// University rankings for any country, from OpenAlex (CC0): every institution of type "education" in the
// country, ordered by the citations its papers have received. One API call per country, no key needed.
// This measures research impact — not teaching quality or prestige — which is why it is labelled that way.

type Inst = { display_name: string; cited_by_count: number; works_count: number; type: string };

const countries = loadCountries();

/** Minimum number of institutions OpenAlex must return, otherwise the ranking is not worth a tab. */
const MIN = 5;

function fetchFor(cc: string) {
  return async (): Promise<Fetched> => {
    const url =
      `https://api.openalex.org/institutions?filter=country_code:${cc},type:education&sort=cited_by_count:desc&per-page=50` +
      `&select=display_name,cited_by_count,works_count,type`;
    const res = await getJson<{ results: Inst[] }>(url);
    const seen = new Set<string>();
    const items = res.results
      .filter((i) => i.cited_by_count > 0 && !seen.has(i.display_name) && seen.add(i.display_name))
      .map((i) => ({ name: i.display_name, country: cc, value: i.cited_by_count, detail: `${i.works_count.toLocaleString("en-US")} papers` }));
    if (items.length < MIN) throw new Error(`only ${items.length} institutions for ${cc}`);
    return {
      year: new Date().getFullYear(),
      source: {
        kind: "api",
        name: "OpenAlex, citations received by each institution's papers",
        url: "https://openalex.org/institutions",
        license: "CC0 1.0 (OpenAlex)",
        note: "Counts every citation to papers by authors affiliated with the institution, so large and old universities score high. It measures research impact, not teaching quality.",
      },
      items,
    };
  };
}

/** A "top research universities" ranking for each given country code. */
export function researchUniversities(codes: string[]): Pipeline[] {
  return codes.map((cc) => {
    const name = countries.byCode2.get(cc)?.name ?? cc;
    return rank(
      cc,
      "research-universities",
      {
        kind: "universities",
        title: `Top Research Universities in ${name}`,
        short: "Research impact",
        sort: 2,
        desc: `Universities and colleges in ${name} ranked by the total citations their research has received (OpenAlex).`,
        unit: "citations",
      },
      fetchFor(cc),
    );
  });
}

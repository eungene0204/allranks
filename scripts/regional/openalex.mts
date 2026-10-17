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

type Metric = {
  slug: string;
  short: string;
  title: string;
  description: string;
  unit: string;
  field: string;
  value: (i: Inst & { summary_stats?: { h_index?: number; i10_index?: number; "2yr_mean_citedness"?: number } }) => number;
  detail: (i: Inst) => string;
  decimals?: number;
};

// These are separate, standard bibliometric measures from the same open dataset. They describe
// research volume, breadth, and recent citation rate; none is presented as teaching quality.
const METRICS: Metric[] = [
  {
    slug: "research-publications", short: "Publications", title: "Universities by Research Publications",
    description: "Universities and colleges ranked by the number of scholarly works indexed by OpenAlex. This measures research volume, not teaching quality.",
    unit: "works", field: "works_count", value: (i) => i.works_count, detail: (i) => `${i.cited_by_count.toLocaleString("en-US")} citations`,
  },
  {
    slug: "research-h-index", short: "Research h-index", title: "Universities by Research h-index",
    description: "Universities and colleges ranked by OpenAlex's institutional h-index, which combines publication volume and citation impact. This is a research metric, not a measure of teaching quality.",
    unit: "h-index", field: "summary_stats.h_index", value: (i) => i.summary_stats?.h_index ?? 0,
    detail: (i) => `${i.works_count.toLocaleString("en-US")} works`,
  },
  {
    slug: "research-i10-index", short: "Research i10-index", title: "Universities by Research i10-index",
    description: "Universities and colleges ranked by OpenAlex's institutional i10-index, the number of works with at least ten citations. This is a research metric, not a measure of teaching quality.",
    unit: "i10-index", field: "summary_stats.i10_index", value: (i) => i.summary_stats?.i10_index ?? 0,
    detail: (i) => `${i.works_count.toLocaleString("en-US")} works`,
  },
  {
    slug: "recent-research-citedness", short: "Recent citedness", title: "Universities by Recent Research Citedness",
    description: "Universities and colleges ranked by OpenAlex's mean citedness for works published in the last two years. Recent citation rates vary by field and are not a measure of teaching quality.",
    unit: "mean citations per work", field: "summary_stats.2yr_mean_citedness", value: (i) => i.summary_stats?.["2yr_mean_citedness"] ?? 0,
    detail: (i) => `${i.works_count.toLocaleString("en-US")} works`, decimals: 2,
  },
];

function metricFor(cc: string, metric: Metric): Pipeline {
  const name = countries.byCode2.get(cc)?.name ?? cc;
  return rank(
    cc,
    metric.slug,
    {
      kind: "universities", title: `${metric.title} in ${name}`, short: metric.short,
      sort: metric.slug === "research-publications" ? 3 : metric.slug === "research-h-index" ? 4 : metric.slug === "research-i10-index" ? 5 : 6,
      desc: `${metric.description} OpenAlex is an open scholarly index; larger and older institutions tend to have more indexed research.`,
      unit: metric.unit, decimals: metric.decimals ?? 0,
    },
    async () => {
      const url = `https://api.openalex.org/institutions?filter=country_code:${cc},type:education&sort=${metric.field}:desc&per-page=50&select=display_name,cited_by_count,works_count,type,summary_stats`;
      const res = await getJson<{ results: (Inst & { summary_stats?: { h_index?: number; i10_index?: number; "2yr_mean_citedness"?: number } })[] }>(url);
      const seen = new Set<string>();
      const items = res.results
        .filter((i) => metric.value(i) > 0 && !seen.has(i.display_name) && seen.add(i.display_name))
        .map((i) => ({ name: i.display_name, country: cc, value: metric.value(i), detail: metric.detail(i) }));
      if (items.length < MIN) throw new Error(`only ${items.length} institutions for ${cc} with ${metric.field}`);
      return {
        year: new Date().getFullYear(),
        source: {
          kind: "api" as const,
          name: `OpenAlex, institutional ${metric.short}`,
          url: "https://openalex.org/institutions",
          license: "CC0 1.0 (OpenAlex)",
          note: "OpenAlex indexes scholarly works and citations. Coverage and citation practices vary by institution and field; this is a research measure, not a ranking of teaching quality.",
        },
        items,
      };
    },
  );
}

/** Supplement the citation ranking with distinct, standard measures where OpenAlex has five or more institutions. */
export function researchUniversityMetrics(codes: string[]): Pipeline[] {
  return codes.flatMap((cc) => METRICS.map((metric) => metricFor(cc, metric)));
}

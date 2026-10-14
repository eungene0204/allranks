import { formatValue, ranked } from "./format";
import type { Ranking } from "./types";

// Plain-language highlights generated from a ranking's own numbers. Every sentence is a fact computed from the rows
// (leaders, gaps, spread, regions); nothing is looked up elsewhere, so the text can never disagree with the table.

export type CountryLookup = (code: string) => { name: string; region: string } | undefined;

const MONTH = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const period = (r: Ranking) => (r.asOf ? MONTH.format(new Date(`${r.asOf}-01T00:00:00Z`)) : String(r.year));

const regionName = (r: string) => (r === "Americas" ? "the Americas" : r);
const list = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);
const times = (x: number) => (x >= 10 ? Math.round(x) : Math.round(x * 10) / 10).toLocaleString("en-US");
const median = (vs: number[]) => {
  const s = [...vs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function rankingInsights(r: Ranking, countryOf: CountryLookup): string[] {
  const e = ranked(r);
  if (e.length < 3) return [];
  const asc = r.order === "asc";
  const fmt = (v: number) => formatValue(r, v);
  const [a, b, c] = e;
  const out: string[] = [];
  const where = r.scope ? `Within ${countryOf(r.scope)?.name ?? r.scope}, ` : "";
  const unit = r.scope || r.multi ? "entries" : "countries and territories";

  // 1. Who leads.
  out.push(
    `${where}${where ? a.name : `As of ${period(r)}, ${a.name}`} ${where ? `ranks first in ${period(r)}` : "ranks first"}${asc ? " (lowest value)" : ""} with ${fmt(a.value)}, ` +
      `followed by ${b.name} (${fmt(b.value)}) and ${c.name} (${fmt(c.value)}).`,
  );

  // 2. How far ahead.
  if (a.value > 0 && b.value > 0) {
    const ratio = asc ? b.value / a.value : a.value / b.value;
    if (ratio >= 1.5) out.push(`${a.name} is ${times(ratio)} times ${asc ? "lower" : "higher"} than ${b.name}, the runner-up.`);
    else if (ratio <= 1.01) out.push(`The top two are virtually level: ${a.name} and ${b.name} differ by less than 1%.`);
  }

  // 3. Spread of the whole list.
  if (e.length >= 10) {
    const vs = e.map((x) => x.value);
    const last = e[e.length - 1];
    out.push(
      `Across ${e.length} ${unit}, values run from ${fmt(a.value)} (${a.name}) to ${fmt(last.value)} (${last.name}), with a median of ${fmt(median(vs))}.`,
    );
  }

  // 4. Which parts of the world dominate the top of a world ranking.
  if (!r.scope && !r.multi && e.length >= 10) {
    const regions = new Map<string, number>();
    for (const x of e.slice(0, 10)) {
      const region = countryOf(x.country)?.region;
      if (region) regions.set(region, (regions.get(region) ?? 0) + 1);
    }
    const parts = [...regions].sort((p, q) => q[1] - p[1] || p[0].localeCompare(q[0])).map(([name, n]) => `${n} from ${regionName(name)}`);
    if (parts.length >= 2) out.push(`By region, the top 10 is made up of ${list(parts)}.`);
    else if (parts.length === 1) out.push(`All of the top 10 are in ${regionName([...regions.keys()][0])}.`);
  }

  // 5. For lists of things (companies, cities…), which countries hold most entries.
  if (r.multi && !r.scope && e.length >= 10) {
    const counts = new Map<string, number>();
    for (const x of e) counts.set(x.country, (counts.get(x.country) ?? 0) + 1);
    const top = [...counts].sort((p, q) => q[1] - p[1]).slice(0, 3).filter(([, n]) => n > 1);
    if (top.length) {
      const part = ([code, n]: [string, number]) => `${countryOf(code)?.name ?? code} (${n})`;
      out.push(`${part(top[0]).replace(/ \((\d+)\)$/, " leads with $1")} of the ${e.length} entries${top.length > 1 ? `, followed by ${list(top.slice(1).map(part))}` : ""}.`);
    }
  }

  // 6. Where the figures come from.
  const unverified = r.source.kind === "agent" && r.source.verified === false;
  out.push(
    `Source: ${r.source.name}, ${period(r)}.${r.unit ? ` Unit: ${r.unit}.` : ""}` +
      (unverified ? " They were collected by an AI agent from the pages listed below and have not yet been checked by a person." : ""),
  );
  return out;
}

/** One-line snippet for the page's meta description. */
export function rankingSnippet(r: Ranking): string {
  const e = ranked(r);
  if (e.length < 3) return r.desc;
  const fmt = (v: number) => formatValue(r, v);
  return `${r.desc} ${period(r)}: ${e[0].name} ranks first (${fmt(e[0].value)}), then ${e[1].name} (${fmt(e[1].value)}) and ${e[2].name} (${fmt(e[2].value)}).`;
}

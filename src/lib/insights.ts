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
  if (r.entityType === "language") {
    return [
      `In ${period(r)}, ${a.name} was the most studied language on Duolingo, followed by ${b.name} and ${c.name}.`,
      "Duolingo publishes the order of the top 10 languages, not learner counts for each language.",
      `Source: ${r.source.name}, ${period(r)}.`,
    ];
  }
  if (r.entityType === "port") {
    return [
      `In the ${r.editionYear ?? period(r)} edition, Lloyd’s List ranked ${a.name} first, followed by ${b.name} and ${c.name}.`,
      `The public edition gives the order of ${e.length} ports; it does not publish their exact throughput figures.`,
      `Source: ${r.source.name}, ${period(r)}.`,
    ];
  }
  if (r.entityType === "bank") {
    return [
      `In the ${r.editionYear ?? period(r)} edition, ${a.name} ranks first by total assets, followed by ${b.name} and ${c.name}.`,
      `The published table lists ${e.length} banks and rounds assets to ${r.decimals} decimal places in ${r.unit}.`,
      `Source: ${r.source.name}, ${r.editionYear ?? period(r)}.`,
    ];
  }
  if (r.entityType === "product") {
    return [
      `In the ${period(r)} source list, ${a.name} is listed first, followed by ${b.name} and ${c.name}.`,
      "The order follows the cited source; category-specific picks may not be direct head-to-head comparisons.",
      `Source: ${r.source.name}.`,
    ];
  }
  const out: string[] = [];
  const where = r.scope ? `Within ${countryOf(r.scope)?.name ?? r.scope}, ` : "";
  const unit = r.entityType === "sector" ? "sectors" : r.entityType === "institution" ? "institutions" : r.scope || r.multi ? "entries" : "countries and territories";
  // 1. Who leads.
  out.push(
    `${where}${where ? a.name : `As of ${period(r)}, ${a.name}`} ${where ? `ranks first in ${period(r)}` : "ranks first"}${asc ? " (lowest value)" : ""} with ${fmt(a.value)}, ` +
      `followed by ${b.name} (${fmt(b.value)}) and ${c.name} (${fmt(c.value)}).`,
  );

  // 2. How far ahead.
  if (!/rank|score|index|rating|performer|celsius|fahrenheit/i.test(`${r.unit} ${r.title}`) && a.value > 0 && b.value > 0) {
    const ratio = asc ? b.value / a.value : a.value / b.value;
    if (ratio >= 1.5) out.push(asc
      ? `${b.name} has ${times(ratio)} times the value of ${a.name}.`
      : `${a.name} has ${times(ratio)} times the value of ${b.name}.`);
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
  if (!r.entityType && !r.scope && !r.multi && e.length >= 10) {
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

/** Full answer for the page introduction; the linked source is displayed separately. */
export function rankingSummary(r: Ranking): string {
  const first = ranked(r)[0];
  if (!first) return `${period(r)}: ${r.desc}`;
  if (r.entityType === "sector") return `${period(r)}: ${first.name} had the largest net employment change at ${formatValue(r, first.value)}. ${r.items.length} U.S. industry sectors.`;
  if (r.entityType === "bank") return `${r.editionYear ?? period(r)}: ${first.name} ranks first by total assets at ${formatValue(r, first.value)}. ${r.items.length} banks.`;
  return `${period(r)}: ${first.name} ${r.entityType === "product" ? "is listed first in the source" : "ranks first"}${r.entityType ? "" : ` at ${formatValue(r, first.value)}`}. ${r.items.length} entries${r.entityType ? "." : `; unit: ${r.unit}.`}`;
}

/** A concise, topic-specific search snippet without repeating a long source definition. */
export function rankingSnippet(r: Ranking): string {
  const text = `${r.short ?? r.title}. ${rankingSummary(r)}`;
  if (text.length <= 200) return text;
  return `${text.slice(0, 197).replace(/\s+\S*$/, "").replace(/[.,;:]$/, "")}…`;
}

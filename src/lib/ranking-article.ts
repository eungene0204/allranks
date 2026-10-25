import { formatValue } from "./format.ts";
import { metricReadingNotes } from "./metric-reading.ts";
import { editorialProfile } from "./editorial-profiles.ts";
import type { Ranking } from "./types";
import type { RankingArticle, EditorialReference } from "./editorial-types";

export type PublisherDefinition = { name: string; definition: string; organization: string; topics: string[] };
export type ArticleContext = {
  definitions: { retrievedAt: string; indicators: Record<string, PublisherDefinition> };
  access: { sources: { url: string; checkedAt: string; status?: number; error?: string }[] };
  countryNames: Record<string, string>;
};

const snapshotSource = (r: Ranking) => /(?:openalex\.org|ourairports\.com|geonames\.org)/.test(r.source.url ?? "");
const clean = (text: string) => text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const number = (value: number) => value.toLocaleString("en-US");
const quote = (text: string) => clean(text).split(/\s+/).slice(0, 24).join(" ");

/** Full reading article for every public dataset; observations stay separate from publisher definitions. */
export function buildRankingArticle(r: Ranking, context: ArticleContext): RankingArticle {
  const profile = editorialProfile(r);
  const rows = [...r.items].sort((a, b) => (r.order === "asc" ? a.value - b.value : b.value - a.value) || a.name.localeCompare(b.name));
  const first = rows[0];
  if (!first) throw new Error(`Cannot write an article for empty dataset ${r.id}`);
  const values = rows.map((row) => row.value).sort((a, b) => a - b);
  const unique = [...new Set(values)];
  const period = r.asOf ?? String(r.year);
  const place = r.scope ? context.countryNames[r.scope] ?? r.scope : undefined;
  const fmt = (value: number) => formatValue(r, value);
  const code = r.source.url?.includes("data.worldbank.org/indicator/") ? decodeURIComponent(r.source.url.split("/indicator/")[1].split(/[?#]/)[0]) : undefined;
  const definition = code ? context.definitions.indicators[code] : undefined;
  const scope = place ? `the included entries within ${place}` : r.entityType ? "the listed entities" : r.multi ? "the listed entries, some of which share a country label" : "the included countries and territories";
  const isOrdinal = ["product-picks", "ordinal", "chart"].includes(profile.id) && /rank|position/i.test(r.unit);
  const distinctCount = `${number(rows.length)} entries and ${number(unique.length)} distinct stored ${isOrdinal ? "positions" : "values"}`;
  const compiled = new Date(r.updatedAt).toISOString().slice(0, 10);
  const sources: EditorialReference[] = [...new Set([r.source.url, ...(r.source.urls ?? [])].filter((url): url is string => Boolean(url)))].map((url, index) => ({ title: index ? `${r.source.name}: additional reference ${index + 1}` : r.source.name, url }));
  if (profile.id === "arms-volume") sources.push({ title: "SIPRI: transfer-volume methodology", url: "https://www.sipri.org/databases/armstransfers/sources-and-methods" });
  if (profile.id === "p-value") sources.push({ title: "American Statistical Association: interpreting p-values", url: "https://www.amstat.org/asa/files/pdfs/p-valuestatement.pdf" });
  if (/Governance estimate/i.test(r.title)) sources.push({ title: "World Bank: WGI methodology", url: "https://www.worldbank.org/en/publication/worldwide-governance-indicators/documentation" });
  if (r.source.url?.includes("openalex.org")) sources.push({ title: "OpenAlex: research metrics and institution definitions", url: "https://help.openalex.org/data/institutions/" });
  if (r.source.url?.includes("ourairports.com")) sources.push({ title: "OurAirports: measurement fields", url: "https://ourairports.com/help/data-dictionary.html" });
  if (r.source.url?.includes("geonames.org")) sources.push({ title: "GeoNames: extract fields and coverage", url: "https://download.geonames.org/export/dump/readme.txt" });
  if (code && definition) sources.push({ title: `World Bank definition: ${definition.name}`, url: `https://api.worldbank.org/v2/indicator/${encodeURIComponent(code)}?format=json` });

  const measure = [
    `The question here concerns “${r.title}” for ${scope}. ${clean(r.desc)}`,
    `The printed unit is ${r.unit}; the displayed ${snapshotSource(r) ? "collection snapshot" : "reference period"} is ${period}${r.editionYear ? `, with publisher edition ${r.editionYear}` : ""}. ${definition ? `The World Bank’s indicator name is “${clean(definition.name)}”${code ? ` (${code})` : ""}. ` : ""}${profile.interpretation}`,
  ];
  if (definition && !definition.definition.trim()) measure.push("The publisher metadata retrieved for this indicator do not include explanatory definition text. The description above comes from the stored source-attributed snapshot; this page does not claim that a new detailed definition was independently verified.");
  if (snapshotSource(r)) measure.push(`The ${period} label identifies this collected snapshot. It should not be read as a claim that every underlying observation or indexed work originated during ${period}.`);

  const findings: string[] = [];
  if (profile.id === "binary") {
    const yes = rows.filter((row) => row.value === 1);
    const no = rows.filter((row) => row.value === 0);
    findings.push(`The stored snapshot records yes for ${yes.length} entries and no for ${no.length} entries. ${yes.length + no.length !== rows.length ? "Other stored codes are present; consult the source before interpreting them." : "These are counts of reported codes, not a score of implementation quality."}`);
    if (yes.length) findings.push(`Examples recorded as yes include ${yes.slice(0, 3).map((row) => row.name).join(", ")}. Entries with the same code have the same recorded answer even if their displayed positions differ.`);
  } else if (isOrdinal) {
    findings.push(`In this source-ordered list, ${first.name} is shown first${first.detail ? ` with the note “${clean(first.detail)}”` : ""}. The list contains ${rows.length} entries. This establishes its place in the stored list, rather than a measured performance margin.`);
    if (rows[1]) findings.push(`${rows[1].name} follows${rows[1].detail ? ` with the note “${clean(rows[1].detail)}”` : ""}. Read those selection contexts before assuming that the first item serves the same purpose as the second.`);
  } else if (profile.id === "p-value") {
    findings.push(`The snapshot stores ${rows.length} p-values with ${unique.length} distinct recorded values. The printed range is ${fmt(values[0])} to ${fmt(values.at(-1)!)}. Rounding may conceal smaller nonzero values or differences.`);
    findings.push("These values are not effect sizes. This page does not classify a country as better, declare a hypothesis true or infer practical importance from a threshold.");
  } else if (profile.id === "local-currency") {
    findings.push(`The snapshot contains ${distinctCount} in local currency. The raw sorting places ${first.name} first at ${fmt(first.value)}, but the currency units differ between economies. That position is not a comparable international economic result.`);
    findings.push("No cross-country difference or relative-performance conclusion is drawn from these raw amounts. A common-currency series or compatible within-country history is needed for that purpose.");
  } else {
    const firstGroup = rows.filter((row) => row.value === first.value);
    findings.push(`${firstGroup.length === 1 ? `${first.name} has` : `${firstGroup.slice(0, 3).map((row) => row.name).join(", ")}${firstGroup.length > 3 ? ` and ${firstGroup.length - 3} other entries have` : " have"}`} the ${r.order === "asc" ? "lowest" : "highest"} listed value, ${fmt(first.value)}. ${firstGroup.length > 1 ? `There are ${firstGroup.length} entries at that same stored value; alphabetical ordering does not distinguish their performance.` : `This is a position within ${rows.length} included entries, not proof of leadership beyond this coverage.`}`);
    if (unique.length === 1) findings.push(`All ${rows.length} entries share the same stored value. The table therefore provides no measured separation between them; its displayed positions are a name-ordering convention.`);
    else if (["score", "policy-assessment", "p-value", "sample-size", "safety-rating", "meta-ranking"].includes(profile.id)) findings.push(`There are ${unique.length} distinct stored values across the ${rows.length} entries. The recorded scale runs from ${fmt(values[0])} to ${fmt(values.at(-1)!)}. Interpret this range using the measure’s definition, rather than treating it as a proportional quality gap.`);
    else {
      const midpoint = values.length >> 1;
      const middle = values.length % 2 ? values[midpoint] : (values[midpoint - 1] + values[midpoint]) / 2;
      const low = values[Math.floor((values.length - 1) * 0.25)];
      const high = values[Math.ceil((values.length - 1) * 0.75)];
      findings.push(`To look beyond the leading entry, the middle half of listed observations lies between ${fmt(low)} and ${fmt(high)}, using the stored values at the rounded-outward 25% and 75% index positions. The median is ${fmt(middle)}. These describe this list’s distribution, not an average weighted by population or economic size.`);
      const zeros = values.filter((value) => value === 0).length;
      const negatives = values.filter((value) => value < 0).length;
      if (zeros || negatives) findings.push(`The list includes ${zeros} recorded zero values and ${negatives} negative values. A recorded zero is different from a missing observation; negative values must be interpreted under the indicator definition rather than omitted for looking unusual.`);
    }
  }

  const method = [
    `AllRanks ${r.source.kind === "manual" ? "compiled this source list" : r.source.kind === "agent" ? "collected this source material with AI assistance" : "retrieved this dataset"} on ${compiled}. The table retains the stored values and sorts ${r.order === "asc" ? "from lowest to highest" : "from highest to lowest"}; equal stored values are ordered by name. Formatting can round two different values to the same printed label.`,
    `${r.source.kind === "manual" || r.source.kind === "agent" ? "The published snapshot records source-list verification. That is comparison with the cited material, not firsthand testing or an independent audit of the publisher’s methods." : "Collection and validation checks concern the stored snapshot. They are not independent field measurements or an expert audit of every source observation."} ${code ? "For this World Bank series, the collector chooses the newest single year with at least ten matched country observations; countries with only older available observations can be absent." : ""}`.trim(),
  ];
  const caution = [profile.limitation, ...metricReadingNotes(r)];
  if (r.source.note) caution.push(`Dataset-specific source note: ${clean(r.source.note)}`);
  if (!r.entityType && !r.scope && !r.multi) {
    const countries = new Set(rows.flatMap((row) => row.country ? [row.country] : []));
    caution.push(`The table includes ${countries.size} distinct country/territory labels for this snapshot. Coverage is the set of recorded entries, not a claim that every country supplied a comparable observation. Missing values have not been set to zero.`);
  } else caution.push(`The coverage for this page is exactly the ${rows.length} listed entries. It does not establish the size or completeness of the full eligible population.`);
  if (profile.id === "projection") caution.push(`The ${period} label and the horizon specified in the indicator name must be read separately. Treat the stored result as a scenario-based estimate, not as a newly observed fact about every included entry.`);

  return {
    title: profile.question,
    profile: profile.id,
    lead: `Read “${r.title}” as a comparison of ${scope} under the stated ${r.unit} measure. ${profile.id === "local-currency" ? "Raw local-currency amounts do not support a common international ranking." : profile.id === "binary" ? "Its yes/no codes form groups rather than a performance ladder." : profile.id === "projection" ? "The result is conditional on projection assumptions." : "The useful conclusion depends on the definition, included entries and reference period."}`,
    sections: [
      { title: "What question does this measure answer?", paragraphs: measure },
      { title: "What the included observations show", paragraphs: findings },
      { title: "How to use the comparison", paragraphs: [profile.decision] },
      { title: "How this page was prepared", paragraphs: method },
      { title: "Limits that matter for this dataset", paragraphs: caution },
    ],
    references: sources,
    definitionExcerpt: definition?.definition && code ? { text: quote(definition.definition) + (clean(definition.definition).split(/\s+/).length > 24 ? " …" : ""), url: `https://api.worldbank.org/v2/indicator/${encodeURIComponent(code)}?format=json`, retrievedAt: context.definitions.retrievedAt } : undefined,
    sourceAccess: context.access.sources.find((source) => source.url === r.source.url),
  };
}

import { editorialProfile } from "./editorial-profiles";
import type { Ranking } from "./types";

/** Reading notes describe this collector's scope, not an independent audit of each row. */
export function collectionNote(r: Ranking): string {
  const url = r.source.url ?? "";
  if (url.includes("data.worldbank.org")) return "This snapshot uses one reference year. The collector chooses the newest year with at least 10 matched country observations, which can exclude countries with older available data. First place means first among the listed observations, not a confirmed worldwide leader.";
  if (url.includes("openalex.org")) return "These are indexed research metrics, not measures of teaching quality. The snapshot year is the collection context; cumulative publication and citation counts can include research from many years. Institution boundaries and index coverage affect comparisons.";
  if (url.includes("ourairports.com")) return "This is a community-maintained airport snapshot, not a new airport survey. Missing records or measurements are omitted. Runway length and elevation describe physical features, not passenger traffic or operational suitability.";
  if (url.includes("geonames.org")) return "GeoNames combines records from different sources. Population reference dates can differ between places; the snapshot year does not make every population observation contemporaneous. Check whether an entry describes a city or a wider urban area before comparing it.";
  if (/SHARP rating/i.test(r.unit)) return "These are published test ratings for the listed models, not tests performed by AllRanks. Equal ratings are the same reported category; alphabetical positions do not distinguish their safety. Read the original testing body’s method and model details.";
  if (r.entityType === "product" && r.category === "everyday") return "These are the named publisher’s selections. AllRanks checked the source list, not the products in a laboratory. Category winners may address different needs; source order is not a shared performance score. Read the item notes and original testing method before choosing.";
  if (r.scope) return "Positions compare only the entries listed within this country. An omitted region or institution has not been assigned zero. Check the source notes for inclusion rules and the reference period for the observations.";
  return "Positions apply to the included entries and the stated measure. An omitted country or entity has not been assigned zero. A high or low value is not an overall quality rating; check the definition, reference period and source before drawing a conclusion.";
}

export function supportsSnapshotComparison(r: Ranking): boolean {
  return r.items.length >= 2 && !["local-currency", "binary", "ordinal", "product-picks", "p-value", "safety-rating", "meta-ranking"].includes(editorialProfile(r).id) && !/rank|chart position/i.test(r.unit) && r.prefix !== "#";
}

/** These collectors label a retrieval snapshot, rather than a common observation year. */
export function usesSnapshotYear(r: Pick<Ranking, "source">): boolean {
  return /(?:openalex\.org|ourairports\.com|geonames\.org)/.test(r.source.url ?? "");
}

/** A reference year is distinct from the date the file was last refreshed. */
export function freshnessLabel(year: number, currentYear = new Date().getFullYear()) {
  return year >= currentYear ? "Latest published data" : "Historical data";
}

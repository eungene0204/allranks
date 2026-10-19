import { freshnessLabel } from "@/lib/freshness";

export default function FreshnessBadge({ year, editionYear }: { year: number; editionYear?: number }) {
  const labelYear = editionYear ?? year;
  const historical = labelYear < new Date().getFullYear();
  return <span className={`freshness-badge${historical ? " freshness-historical" : ""}`}>{freshnessLabel(labelYear)} · {labelYear}</span>;
}

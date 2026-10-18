import { freshnessLabel } from "@/lib/freshness";

export default function FreshnessBadge({ year }: { year: number }) {
  const historical = year < new Date().getFullYear();
  return <span className={`freshness-badge${historical ? " freshness-historical" : ""}`}>{freshnessLabel(year)} · {year}</span>;
}

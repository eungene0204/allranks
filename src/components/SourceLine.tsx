import type { Ranking } from "@/lib/types";

const DAY = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

/** "Source: … · fetched Oct 14, 2026" footer shared by ranking and country pages. */
export default function SourceLine({ ranking: r }: { ranking: Ranking }) {
  const sample = r.source.kind === "manual" && r.source.verified === false;
  return (
    <p className="source">
      Source:{" "}
      {r.source.url ? (
        <a href={r.source.url} target="_blank" rel="noopener noreferrer">
          {r.source.name}
        </a>
      ) : (
        r.source.name
      )}
      {r.source.license && ` · ${r.source.license}`} · {r.source.kind === "manual" ? "entered by hand" : "fetched"}{" "}
      {DAY.format(new Date(r.updatedAt))}
      {r.source.note && (sample || r.source.kind !== "manual") && <span className="muted"> — {r.source.note}</span>}
    </p>
  );
}

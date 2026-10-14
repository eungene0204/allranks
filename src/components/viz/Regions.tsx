import Link from "next/link";
import { countryInfo } from "@/lib/data";
import { formatValue, ranked } from "@/lib/format";
import type { Ranking } from "@/lib/types";

/** Additive totals: one 100% bar split by world region (five categorical colours, each segment direct-labelled), with each region's top entries. */
export default function Regions({ ranking: r }: { ranking: Ranking }) {
  const e = ranked(r).filter((x) => x.value > 0);
  if (e.length < 10) return null;
  const total = e.reduce((s, x) => s + x.value, 0);
  const by = new Map<string, typeof e>();
  for (const x of e) {
    const region = countryInfo(x.country)?.region || "Other";
    by.set(region, [...(by.get(region) ?? []), x]);
  }
  // Fixed colour per region (never by rank), so a region keeps its colour on every page.
  const SLOT: Record<string, number> = { Asia: 1, Americas: 2, Europe: 3, Africa: 4, Oceania: 5 };
  const parts = [...by]
    .map(([name, xs]) => ({ name, xs, value: xs.reduce((s, x) => s + x.value, 0) }))
    .sort((a, b) => b.value - a.value);
  const pct = (v: number) => (v / total) * 100;
  const fmtPct = (v: number) => `${pct(v).toLocaleString("en-US", { maximumFractionDigits: pct(v) < 10 ? 1 : 0 })}%`;

  return (
    <figure className="viz">
      <div className="rg" role="img" aria-label={`${r.title} by world region: ${parts.map((p) => `${p.name} ${fmtPct(p.value)}`).join(", ")}.`}>
        <div className="rg-bar">
          {parts.map((p) => (
            <div key={p.name} className={`c${SLOT[p.name] ?? 0}`} style={{ width: `${pct(p.value)}%` }} data-tip={`${p.name}: ${formatValue(r, p.value)} (${fmtPct(p.value)})`}>
              {pct(p.value) >= 7 && <span>{p.name} {fmtPct(p.value)}</span>}
            </div>
          ))}
        </div>
        <ul className="rg-list">
          {parts.map((p) => (
            <li key={p.name}>
              <div className="rg-head">
                <i className={`c${SLOT[p.name] ?? 0}`} />
                <b>{p.name}</b>
                <span className="muted">{fmtPct(p.value)} · {p.xs.length} {p.xs.length === 1 ? "entry" : "entries"}</span>
              </div>
              <div className="rg-top">
                {p.xs.slice(0, 3).map((x) => (
                  <Link key={x.name} href={`/country/${x.country}`} prefetch={false} data-tip={`${x.name}: ${formatValue(r, x.value)}`}>
                    {x.flag} {x.name} <span className="muted">{formatValue(r, x.value)}</span>
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="viz-cap">Share of the combined total of {formatValue(r, total)}, grouped by the world region each entry belongs to.</figcaption>
    </figure>
  );
}

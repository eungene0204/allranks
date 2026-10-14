import { countryInfo } from "@/lib/data";
import { formatValue, ranked } from "@/lib/format";
import { compact, makeScale } from "@/lib/scale";
import type { Ranking } from "@/lib/types";

const BINS = 14;

/** Rates per 1,000 people and the like: how many entries fall in each band of values, with the median marked. */
export default function Histogram({ ranking: r }: { ranking: Ranking }) {
  const e = ranked(r);
  if (e.length < 15) return null;
  const vs = e.map((x) => x.value);
  const scale = makeScale(Math.min(...vs), Math.max(...vs));
  const bins = Array.from({ length: BINS }, () => [] as typeof e);
  for (const x of e) bins[Math.min(BINS - 1, Math.floor(scale.pos(x.value) * BINS))].push(x);
  const peak = Math.max(...bins.map((b) => b.length));
  const sorted = [...vs].sort((a, b) => a - b);
  const med = sorted.length % 2 ? sorted[sorted.length >> 1] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const fmt = (v: number) => formatValue(r, v);
  const medPos = Math.min(100, Math.max(0, scale.pos(med) * 100));
  const modal = bins.indexOf(bins.find((b) => b.length === peak)!);
  const edge = (i: number) => {
    // Value at the left edge of bin i (inverse of the scale).
    const lo = Math.min(...vs), hi = Math.max(...vs);
    return scale.log ? lo * (hi / lo) ** (i / BINS) : lo + ((hi - lo) * i) / BINS;
  };

  return (
    <figure className="viz">
      <div className="hg" role="img" aria-label={`Histogram of ${r.title}: most entries fall between ${fmt(edge(modal))} and ${fmt(edge(modal + 1))}; the median is ${fmt(med)}.`}>
        <div className="hg-plot">
          <i className="hg-med" style={{ left: `${medPos}%` }}><span>median {fmt(med)}</span></i>
          {bins.map((b, i) => {
            const names = b.slice(0, 6).map((x) => x.name).join(", ");
            return (
              <div className="hg-col" key={i} data-tip={`${fmt(edge(i))} – ${fmt(edge(i + 1))}: ${b.length} ${b.length === 1 ? "entry" : "entries"}${b.length ? ` — ${names}${b.length > 6 ? "…" : ""}` : ""}`}>
                <span className="hg-n">{b.length || ""}</span>
                <i style={{ height: `${(b.length / peak) * 100}%` }} />
              </div>
            );
          })}
        </div>
        <div className="hg-axis">
          {scale.ticks.filter((t) => scale.pos(t) >= 0 && scale.pos(t) <= 1).map((t) => (
            <span key={t} style={{ left: `${scale.pos(t) * 100}%` }}>{compact(t)} {r.unit}</span>
          ))}
        </div>
      </div>
      <figcaption className="viz-cap">
        Bars count how many of the {e.length} {r.scope || r.multi ? "entries" : "countries"} fall in each band of {r.unit}{scale.log ? " (logarithmic bands)" : ""}. The most common band is {fmt(edge(modal))} – {fmt(edge(modal + 1))} ({peak}).
        {!r.scope && !r.multi && ` Highest: ${e[0].name}; lowest: ${e.at(-1)!.name}${countryInfo(e.at(-1)!.country) ? "" : ""}.`}
      </figcaption>
    </figure>
  );
}

import Link from "next/link";
import { getRanking } from "@/lib/data";
import { formatValue, ranked } from "@/lib/format";
import { compact, makeScale } from "@/lib/scale";
import { placeLabels } from "@/lib/labels";
import { AXIS_NAMES, VIZ_PAIRS } from "@/lib/viz";
import type { Ranking } from "@/lib/types";

const LABELS = 7;

/** A figure drawn against a related ranking: one dot per country, so the relationship (and who breaks it) shows. */
export default function Scatter({ ranking: r }: { ranking: Ranking }) {
  const other = getRanking(VIZ_PAIRS[r.id] ?? "");
  if (!other) return null;
  const xv = new Map(other.items.map((i) => [i.country, i.value]));
  const pts = ranked(r)
    .filter((y) => xv.has(y.country) && xv.get(y.country)! > 0 && y.value > 0)
    .map((y) => ({ ...y, x: xv.get(y.country)! }));
  if (pts.length < 15) return null;

  const sx = makeScale(Math.min(...pts.map((p) => p.x)), Math.max(...pts.map((p) => p.x)));
  const sy = makeScale(Math.min(...pts.map((p) => p.value)), Math.max(...pts.map((p) => p.value)));
  const px = (v: number) => 3 + sx.pos(v) * 94;
  const py = (v: number) => 4 + (1 - sy.pos(v)) * 90;
  // Label the extremes on each axis; they are the entries a reader will look for.
  const named = new Set([...pts.slice(0, 4), ...pts.slice(-2), ...[...pts].sort((a, b) => b.x - a.x).slice(0, 3)].slice(0, LABELS + 4).map((p) => p.name));
  // Names go where they fit (nominal 800×450 plot, the 16:9 desktop size); crowded ones stay hover-only.
  const cands = pts.filter((p) => named.has(p.name));
  const sides = placeLabels(
    cands.map((p) => ({ x: px(p.x) * 8, y: py(p.value) * 4.5, r: 4.5, text: `${p.flag} ${p.name}` })),
    { w: 800, h: 450 },
    { hideCrowded: true },
  );
  const sideOf = new Map(cands.map((p, i) => [p.name, sides[i]]));
  const fmtY = (v: number) => formatValue(r, v);
  const fmtX = (v: number) => formatValue(other, v);
  const nameY = AXIS_NAMES[r.id] ?? r.short ?? r.title;
  const nameX = AXIS_NAMES[other.id] ?? other.short ?? other.title;

  return (
    <figure className="viz">
      <div className="sc" role="img" aria-label={`Scatter chart: ${nameY} against ${nameX}, ${pts.length} countries.`}>
        <div className="sc-ylabel">{nameY} ({r.unit}{sy.log ? ", log" : ""})</div>
        <div className="sc-plot">
          {sx.ticks.map((t) => <i key={`x${t}`} className="sc-gx" style={{ left: `${px(t)}%` }} />)}
          {sy.ticks.map((t) => <i key={`y${t}`} className="sc-gy" style={{ top: `${py(t)}%` }} />)}
          {sy.ticks.map((t) => <span key={`yl${t}`} className="sc-ty" style={{ top: `${py(t)}%` }}>{compact(t)}</span>)}
          {pts.map((p) => {
            const title = `${p.name}: ${fmtY(p.value)} · ${nameX} ${fmtX(p.x)}`;
            const style = { left: `${px(p.x)}%`, top: `${py(p.value)}%` };
            return (
              <Link key={p.name} className="sc-dot" style={style} href={`/country/${p.country}`} prefetch={false} data-tip={title} aria-label={title}>
                {sideOf.get(p.name) && <span className={`map-name ${sideOf.get(p.name)}`}>{p.flag} {p.name}</span>}
              </Link>
            );
          })}
        </div>
        <div className="sc-axis">
          {sx.ticks.map((t) => <span key={t} style={{ left: `${px(t)}%` }}>{compact(t)}</span>)}
        </div>
        <div className="sc-xlabel">{nameX} ({other.unit}{sx.log ? ", log" : ""})</div>
      </div>
      <figcaption className="viz-cap">
        Each dot is a country. Sideways: {nameX}. Up: {nameY}. {sx.log || sy.log ? `Axes marked “log” are logarithmic, so each step is ten times the last.` : ""} Hover a dot for its values.
      </figcaption>
    </figure>
  );
}

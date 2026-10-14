import Link from "next/link";
import { countryInfo } from "@/lib/data";
import { formatValue, ranked } from "@/lib/format";
import { compact, makeScale } from "@/lib/scale";
import type { Ranking } from "@/lib/types";

const VW = 800; // virtual width in px used only to keep dots from overlapping
const D = 9; // dot diameter in px
const PAD = 1.5; // % of the width kept free at both ends

type Dot = { name: string; flag: string; country: string; value: number; rank: number; x: number; y: number };

/** Greedy beeswarm: dots stay on their exact x, and slide up/down until they stop touching. */
function swarm(rows: { name: string; flag: string; country: string; value: number; rank: number; x: number }[]) {
  const placed: Dot[] = [];
  for (const d of [...rows].sort((a, b) => a.x - b.x)) {
    for (let k = 0; ; k++) {
      const y = Math.ceil(k / 2) * (k % 2 ? 1 : -1) * (D - 1);
      if (placed.every((p) => Math.hypot(((p.x - d.x) / 100) * VW, p.y - y) >= D)) { placed.push({ ...d, y }); break; }
      if (k > 80) { placed.push({ ...d, y }); break; }
    }
  }
  return placed;
}

const median = (vs: number[]) => {
  const s = [...vs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** Levels (per-capita figures, scores, rates): every entry as a dot on one number line, one row per world region. */
export default function Strip({ ranking: r }: { ranking: Ranking }) {
  const e = ranked(r);
  if (e.length < 8) return null;
  const vs = e.map((x) => x.value);
  const scale = makeScale(Math.min(...vs), Math.max(...vs));
  const at = (v: number) => PAD + Math.min(1, Math.max(0, scale.pos(v))) * (100 - 2 * PAD);

  // One row per world region for countries; a single row for the parts of one country.
  const regionOf = (code: string) => (r.scope || r.multi ? "" : countryInfo(code)?.region ?? "Other");
  const groups = new Map<string, typeof e>();
  for (const x of e) groups.set(regionOf(x.country), [...(groups.get(regionOf(x.country)) ?? []), x]);
  const rows = [...groups]
    .filter(([name]) => name !== "Antarctic")
    .map(([name, xs]) => {
      const dots = swarm(xs.map((x) => ({ ...x, x: at(x.value) })));
      const ys = dots.map((d) => d.y);
      const top = Math.min(0, ...ys) - D / 2 - 2;
      const bottom = Math.max(0, ...ys) + D / 2 + 2;
      return { name, dots, med: median(xs.map((x) => x.value)), top, h: Math.max(28, bottom - top) };
    })
    .sort((a, b) => (r.order === "asc" ? a.med - b.med : b.med - a.med));
  const fmt = (v: number) => formatValue(r, v);
  const first = e[0];
  const last = e[e.length - 1];

  return (
    <figure className="viz">
      <div className="strip" role="img" aria-label={`Distribution of ${r.title}: ${first.name} ranks first with ${fmt(first.value)} and ${last.name} last with ${fmt(last.value)}; the median is ${fmt(median(vs))}.`}>
        {rows.map((row) => (
          <div className="strip-row" key={row.name} style={{ height: row.h }}>
            <div className="strip-label">
              {row.name || "All entries"}
              <span className="muted"> · {row.dots.length}</span>
            </div>
            <div className="strip-plot">
              {scale.ticks.map((t) => (
                <i key={t} className="strip-grid" style={{ left: `${at(t)}%` }} />
              ))}
              <i className="strip-med" style={{ left: `${at(row.med)}%` }} data-tip={`Median: ${fmt(row.med)}`} />
              {row.dots.map((d) => {
                const style = { left: `${d.x}%`, top: `${-row.top + d.y - D / 2}px` };
                const title = `${d.name}: ${fmt(d.value)} (#${d.rank})`;
                return !r.scope && !r.multi ? (
                  <Link key={d.name} className="strip-dot" style={style} href={`/country/${d.country}`} prefetch={false} data-tip={title} aria-label={title} />
                ) : (
                  <span key={d.name} className="strip-dot" style={style} data-tip={title} />
                );
              })}
            </div>
          </div>
        ))}
        <div className="strip-row strip-axis">
          <div className="strip-label" />
          <div className="strip-plot">
            {scale.ticks.map((t) => (
              <span key={t} style={{ left: `${at(t)}%` }}>{compact(t)} {r.unit}</span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="viz-cap">
        Every dot is one {r.scope || r.multi ? "entry" : "country"}, placed by its value ({r.unit}{scale.log ? ", logarithmic scale" : ""}); the vertical bar marks each row’s median.
        {!r.scope && !r.multi && " Rows are world regions, ordered by their median. Hover a dot for its name."}
      </figcaption>
    </figure>
  );
}

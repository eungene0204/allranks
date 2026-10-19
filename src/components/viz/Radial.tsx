import Link from "next/link";
import { formatValue, ranked } from "@/lib/format";
import type { Ranking } from "@/lib/types";

/** A compact radial leaderboard for short rankings. */
export default function Radial({ ranking: r }: { ranking: Ranking }) {
  const entries = ranked(r).slice(0, 12);
  if (entries.length < 5) return null;
  const max = Math.max(...entries.map((x) => x.value), 1);
  const cx = 180, cy = 180, outer = 135, inner = 36;
  const angle = (i: number) => -Math.PI / 2 + (i / entries.length) * Math.PI * 2;
  return (
    <figure className="viz">
      <div className="radial-wrap">
        <svg className="radial-chart" viewBox="0 0 360 360" role="img" aria-label={`Radial leaderboard of ${r.title}. ${entries.map((x, i) => `${i + 1}: ${x.name}, ${formatValue(r, x.value)}`).join("; ")}`}>
          {[0.25, 0.5, 0.75, 1].map((fraction) => <circle key={fraction} cx={cx} cy={cy} r={inner + (outer - inner) * fraction} className="radial-grid" />)}
          {entries.map((x, i) => {
            const a = angle(i), half = Math.PI / entries.length * 0.72;
            const magnitude = r.unit === "Rank" ? (max + 1 - x.value) / max : x.value / max;
            const r1 = inner, r2 = inner + (outer - inner) * Math.max(0.035, magnitude);
            const p1 = `${cx + Math.cos(a - half) * r1},${cy + Math.sin(a - half) * r1}`;
            const p2 = `${cx + Math.cos(a - half) * r2},${cy + Math.sin(a - half) * r2}`;
            const p3 = `${cx + Math.cos(a + half) * r2},${cy + Math.sin(a + half) * r2}`;
            const p4 = `${cx + Math.cos(a + half) * r1},${cy + Math.sin(a + half) * r1}`;
            const polygon = `${p1} ${p2} ${p3} ${p4}`;
            const tip = `${i + 1}. ${x.name}: ${formatValue(r, x.value)}`;
            return <polygon key={x.name} points={polygon} className={`radial-bar s${Math.min(i, 4)}`} data-tip={tip} />;
          })}
          <circle cx={cx} cy={cy} r={inner - 5} className="radial-core" />
          <text x={cx} y={cy - 2} className="radial-count" textAnchor="middle">{entries.length}</text>
          <text x={cx} y={cy + 16} className="radial-label" textAnchor="middle">leaders</text>
        </svg>
        <ol className="radial-key">
          {entries.map((x, i) => <li key={x.name}>
            <i className={`s${Math.min(i, 4)}`} />
            {!r.scope && !r.entityType && x.country ? <Link href={`/country/${x.country}`} prefetch={false}>{x.flag} {x.name}</Link> : <span>{x.name}</span>}
            <b>{formatValue(r, x.value)}</b>
          </li>)}
        </ol>
      </div>
      <figcaption className="viz-cap">{r.unit === "Rank" ? "Each wedge is one entry; longer wedges indicate a higher source rank." : "Each wedge is one entry; longer wedges indicate higher values."}</figcaption>
    </figure>
  );
}

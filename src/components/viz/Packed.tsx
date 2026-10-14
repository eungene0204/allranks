import { hierarchy, pack } from "d3-hierarchy";
import Link from "next/link";
import { formatValue, ranked } from "@/lib/format";
import type { RankedEntry, Ranking } from "@/lib/types";

const GROUPS = 5;

/** A medium-sized additive list: circles packed by area, so size alone shows how big each entry is. */
export default function Packed({ ranking: r }: { ranking: Ranking }) {
  const e = ranked(r).filter((x) => x.value > 0);
  if (e.length < 5) return null;
  const root = hierarchy<{ children?: RankedEntry[]; value?: number }>({ children: e }).sum((d) => d.value ?? 0);
  const leaves = pack<{ children?: RankedEntry[]; value?: number }>().size([100, 100]).padding(0.6)(root).leaves();
  const per = e.length / GROUPS;
  const total = e.reduce((s, x) => s + x.value, 0);
  const link = !r.scope;

  return (
    <figure className="viz">
      <div className="pk" role="img" aria-label={`Bubble chart of ${r.title}: ${e[0].name} is the largest, then ${e[1].name} and ${e[2].name}.`}>
        {leaves.map((l) => {
          const x = l.data as unknown as RankedEntry;
          const d = l.r * 2; // diameter as a % of the box
          const style = { left: `${l.x - l.r}%`, top: `${l.y - l.r}%`, width: `${d}%`, height: `${d}%` };
          const shade = `s${Math.min(GROUPS - 1, Math.floor((x.rank - 1) / per))}`;
          const body = d >= 15 ? (
            <>
              <b>{x.name}</b>
              <span>{formatValue(r, x.value)}</span>
            </>
          ) : d >= 6 ? <b>{!r.scope && x.flag ? x.flag : x.name.slice(0, 3)}</b> : null;
          const title = `${x.name}: ${formatValue(r, x.value)} · ${((x.value / total) * 100).toFixed(1)}% of the total (#${x.rank})`;
          return link ? (
            <Link key={x.name} className={`pk-dot ${shade}`} style={style} href={`/country/${x.country}`} prefetch={false} data-tip={title} aria-label={title}>
              {body}
            </Link>
          ) : (
            <div key={x.name} className={`pk-dot ${shade}`} style={style} data-tip={title} aria-label={title}>
              {body}
            </div>
          );
        })}
      </div>
      <figcaption className="viz-cap">Circle area is each entry’s value; the largest sit in the middle. Stronger colour means a higher rank.</figcaption>
    </figure>
  );
}

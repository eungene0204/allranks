import Link from "next/link";
import { formatValue, ranked } from "@/lib/format";
import type { Ranking } from "@/lib/types";

const SIDE = 7; // rows shown from each end of the list

/** Values that go below zero: the strongest gains and the deepest falls, as bars growing either way from a zero line. */
export default function Diverging({ ranking: r }: { ranking: Ranking }) {
  const e = ranked(r);
  if (e.length < 10) return null;
  const fmt = (v: number) => formatValue(r, v);
  const order = r.order === "asc" ? [...e].reverse() : e; // highest value first
  const rows = order.length > 2 * SIDE ? [...order.slice(0, SIDE), ...order.slice(-SIDE)] : order;
  const pos = Math.max(0, ...rows.map((x) => x.value));
  const neg = Math.max(0, ...rows.map((x) => -x.value));
  const zero = (neg / (pos + neg)) * 100; // % from the left where zero sits
  const below = e.filter((x) => x.value < 0).length;
  const link = !r.scope && !r.multi;

  return (
    <figure className="viz">
      <div className="dv" role="img" aria-label={`${below} of ${e.length} entries are below zero in ${r.title}. Highest: ${order[0].name} (${fmt(order[0].value)}). Lowest: ${order.at(-1)!.name} (${fmt(order.at(-1)!.value)}).`}>
        {rows.map((x, i) => {
          const w = (Math.abs(x.value) / (pos + neg)) * 100;
          const bar = <i className={x.value < 0 ? "neg" : "pos"} style={x.value < 0 ? { right: `${100 - zero}%`, width: `${w}%` } : { left: `${zero}%`, width: `${w}%` }} />;
          return (
            <div key={x.name} className={`dv-row${order.length > 2 * SIDE && i === SIDE ? " gap" : ""}`}>
              <span className="dv-name">
                {link ? <Link href={`/country/${x.country}`} prefetch={false}>{x.flag} {x.name}</Link> : x.name}
              </span>
              <span className="dv-plot">
                <u style={{ left: `${zero}%` }} />
                {bar}
              </span>
              <span className="dv-val">{fmt(x.value)}</span>
            </div>
          );
        })}
      </div>
      <figcaption className="viz-cap">
        The {Math.min(SIDE, order.length)} highest and {Math.min(SIDE, order.length)} lowest of {e.length} entries; {below === 0 ? "none is below zero" : `${below} ${below === 1 ? "is" : "are"} below zero`}. Bars to the left of the line are negative.
      </figcaption>
    </figure>
  );
}

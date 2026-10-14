import Link from "next/link";
import { formatValue, ranked } from "@/lib/format";
import type { Ranking } from "@/lib/types";
import Mark from "../Mark";

/** Short lists of records: a dot on a stem per entry, so gaps between the leaders show clearly. */
export default function Lollipop({ ranking: r }: { ranking: Ranking }) {
  const e = ranked(r).slice(0, 12);
  if (e.length < 3) return null;
  const rankStyle = r.unit === "Rank"; // lower is better: the dot sits further right the better the position
  const max = Math.max(...e.map((x) => x.value));
  const n = ranked(r).length;
  const pct = (x: (typeof e)[number]) => (rankStyle ? ((n + 1 - x.rank) / n) * 100 : (x.value / max) * 100);
  const link = !r.scope;

  return (
    <figure className="viz">
      <ol className="lp">
        {e.map((x) => {
          const name = (
            <>
              {x.logo ? <Mark icon="" logo={x.logo} /> : !r.scope && <span>{x.flag}</span>}
              <span className="lp-text" data-tip={x.name}>{x.name}</span>
            </>
          );
          return (
            <li key={x.name}>
              <span className="lp-name">{link ? <Link href={`/country/${x.country}`} prefetch={false}>{name}</Link> : name}</span>
              <span className="lp-plot">
                <i style={{ width: `${pct(x)}%` }} />
                <b style={{ left: `${pct(x)}%` }} />
              </span>
              <span className="lp-val">{formatValue(r, x.value)}</span>
            </li>
          );
        })}
      </ol>
      <figcaption className="viz-cap">
        {rankStyle ? "The closer a dot is to the right edge, the better the position." : `Stems start at zero, so the length of each stem is the entry’s value.`}
      </figcaption>
    </figure>
  );
}

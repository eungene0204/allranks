import Link from "next/link";
import { formatValue, ranked } from "@/lib/format";
import type { Ranking } from "@/lib/types";
import Mark from "../Mark";

const MEDAL = ["var(--gold)", "var(--silver)", "var(--bronze)"];

/** A short list with a clear winner: the top three as big numbers, the rest as small chips. */
export default function Podium({ ranking: r }: { ranking: Ranking }) {
  const e = ranked(r);
  if (e.length < 4) return null;
  const top = e.slice(0, 3);
  const rest = e.slice(3);
  const lead = top[0].value;

  return (
    <figure className="viz">
      <div className="pd">
        {top.map((x, i) => {
          const inner = (
            <>
              <span className="pd-rank" style={{ background: MEDAL[i] }}>{x.rank}</span>
              <span className="pd-name">
                {x.logo ? <Mark icon="" logo={x.logo} /> : !r.scope && <span>{x.flag}</span>}
                <span title={x.name}>{x.name}</span>
              </span>
              <b className="pd-val">{formatValue(r, x.value)}</b>
              <span className="pd-rel">{i === 0 ? r.unit : `${Math.round((x.value / lead) * 100)}% of #1`}</span>
              <span className="pd-bar"><i style={{ width: `${(x.value / lead) * 100}%` }} /></span>
            </>
          );
          return r.scope ? <div key={x.name} className="pd-card">{inner}</div> : <Link key={x.name} className="pd-card" href={`/country/${x.country}`} prefetch={false}>{inner}</Link>;
        })}
      </div>
      {rest.length > 0 && (
        <ul className="pd-rest">
          {rest.map((x) => (
            <li key={x.name} title={`#${x.rank} ${x.name}: ${formatValue(r, x.value)}`}>
              <span className="muted">#{x.rank}</span> {!r.scope && x.flag} {x.name} <b>{formatValue(r, x.value)}</b>
            </li>
          ))}
        </ul>
      )}
      <figcaption className="viz-cap">The bar under each card is its value as a share of the leader’s.</figcaption>
    </figure>
  );
}

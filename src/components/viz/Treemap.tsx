import Link from "next/link";
import { formatValue, ranked } from "@/lib/format";
import { squarify } from "@/lib/treemap";
import type { Ranking } from "@/lib/types";

const SHOWN = 40; // tiles beyond this are merged into one "Other" tile
const W = 100;
const H = 50;
const GROUPS = 5;

/** Additive totals (GDP, population, tonnes…): each entry's area is its share of the sum of the whole list. */
export default function Treemap({ ranking: r }: { ranking: Ranking }) {
  const e = ranked(r).filter((x) => x.value > 0);
  if (e.length < 5) return null;
  const total = e.reduce((s, x) => s + x.value, 0);
  const head = e.slice(0, SHOWN);
  const rest = e.slice(SHOWN);
  const per = head.length / GROUPS;
  const other = rest.length ? rest.reduce((s, x) => s + x.value, 0) : 0;
  type T = (typeof head)[number] & { other?: boolean };
  const items: { value: number; item: T }[] = head.map((x) => ({ value: x.value, item: x }));
  if (other) items.push({ value: other, item: { rank: 0, name: `${rest.length} others`, country: "", flag: "", value: other, other: true } });
  const tiles = squarify(items, W, H);
  const pct = (v: number) => `${((v / total) * 100).toLocaleString("en-US", { maximumFractionDigits: v / total < 0.1 ? 1 : 0 })}%`;

  return (
    <figure className="viz">
      <div className="tm" role="img" aria-label={`Treemap of ${r.title}: ${e[0].name} holds ${pct(e[0].value)} of the total, ${e[1].name} ${pct(e[1].value)}, ${e[2].name} ${pct(e[2].value)}.`}>
        {tiles.map(({ x, y, w, h, item: t }) => {
          const wp = (w / W) * 100;
          const hp = (h / H) * 100;
          const shade = t.other ? "none" : `s${Math.min(GROUPS - 1, Math.floor((t.rank - 1) / per))}`;
          const style = { left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, width: `${wp}%`, height: `${hp}%` };
          const label = wp >= 5.5 && hp >= 9;
          const body = (
            <>
              {label ? (
                <>
                  <b>{!r.scope && t.flag ? `${t.flag} ` : ""}{t.name}</b>
                  {hp >= 20 && wp >= 8 && <span>{pct(t.value)}</span>}
                </>
              ) : (
                wp >= 3.5 && hp >= 7 && !r.scope && t.flag && <b>{t.flag}</b>
              )}
            </>
          );
          const title = `${t.name}: ${formatValue(r, t.value)} · ${pct(t.value)} of the total${t.other ? "" : ` (#${t.rank})`}`;
          return !r.scope && !t.other && t.country ? (
            <Link key={t.name} className={`tm-tile ${shade}`} style={style} href={`/country/${t.country}`} prefetch={false} data-tip={title}>
              {body}
            </Link>
          ) : (
            <div key={t.name} className={`tm-tile ${shade}`} style={style} data-tip={title}>
              {body}
            </div>
          );
        })}
      </div>
      <figcaption className="viz-cap">
        Each tile’s area is its share of the combined total of {formatValue(r, total)} ({e.length} entries). Stronger colour means a higher rank.
        {rest.length > 0 && ` The smallest ${rest.length} are merged into one grey tile.`}
      </figcaption>
    </figure>
  );
}

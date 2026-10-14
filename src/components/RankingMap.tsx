import Link from "next/link";
import { formatValue, ranked } from "@/lib/format";
import { mapShapes, MAP_H, MAP_W } from "@/lib/map";
import type { Ranking } from "@/lib/types";

const GROUPS = 5; // fifths of the list, best first; each gets a shade class s0 (strongest) … s4

/** World map coloured by rank (not by raw value, so one giant like the US cannot wash out everyone else). */
export default function RankingMap({ ranking: r }: { ranking: Ranking }) {
  const e = ranked(r);
  if (r.scope || r.multi || e.length < 15) return null;

  // Five groups of equal size, best first; a country's group decides its shade.
  const per = e.length / GROUPS;
  const groupOf = (rank: number) => Math.min(GROUPS - 1, Math.floor((rank - 1) / per));
  const byCode = new Map(e.map((x) => [x.country, x]));
  const groups = Array.from({ length: GROUPS }, (_, g) => {
    const rows = e.filter((x) => groupOf(x.rank) === g);
    return { g, from: rows[0]?.value, to: rows.at(-1)?.value, n: rows.length };
  });
  const fmt = (v: number) => formatValue(r, v);

  return (
    <figure className="rank-map">
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        role="img"
        aria-label={`World map of ${r.title}: ${e[0].name} ranks first, ${e[1].name} second, ${e[2].name} third.`}
      >
        {mapShapes().map((s) => {
          const x = s.code ? byCode.get(s.code) : undefined;
          const path = (
            <path
              d={s.d}
              className={x ? `s${groupOf(x.rank)}` : "none"}
            >
              <title>{x ? `${x.name}: ${fmt(x.value)} (#${x.rank})` : s.name}</title>
            </path>
          );
          return x ? (
            <Link key={s.name} href={`/country/${s.code}`} prefetch={false}>
              {path}
            </Link>
          ) : (
            <g key={s.name}>{path}</g>
          );
        })}
      </svg>
      <figcaption className="map-legend" aria-label="Legend">
        {groups.map(({ g, from, to }) =>
          from !== undefined && to !== undefined ? (
            <span key={g} className="map-key">
              <i className={`s${g}`} />
              {from === to ? fmt(from) : `${fmt(from)} – ${fmt(to)}`}
            </span>
          ) : null,
        )}
        <span className="map-key">
          <i className="none" />
          No data
        </span>
      </figcaption>
    </figure>
  );
}

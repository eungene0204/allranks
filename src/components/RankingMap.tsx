import Link from "next/link";
import { countryCoords } from "@/lib/data";
import { formatValue, ranked } from "@/lib/format";
import { placeLabels } from "@/lib/labels";
import { mapShapes, MAP_H, MAP_W, projectPoint } from "@/lib/map";
import type { Ranking } from "@/lib/types";

const GROUPS = 5; // fifths of the list, best first; each gets a shade class s0 (strongest) … s4

/** World map coloured by rank (not by raw value, so one giant like the US cannot wash out everyone else). */
export default function RankingMap({ ranking: r }: { ranking: Ranking }) {
  const e = ranked(r);
  if (r.scope || r.multi || e.length < 15) return null;

  // Five rank groups, best first. Keep equal values together at group boundaries;
  // splitting a binary/ordinal category across shades makes its map misleading.
  const per = e.length / GROUPS;
  const valueCounts = new Map<number, number>();
  for (const row of e) valueCounts.set(row.value, (valueCounts.get(row.value) ?? 0) + 1);
  let through = 0;
  const groupByValue = new Map<number, number>();
  for (const [value, count] of valueCounts) {
    groupByValue.set(value, Math.min(GROUPS - 1, Math.floor((through + count / 2) / per)));
    through += count;
  }
  const groupOf = (value: number) => groupByValue.get(value) ?? GROUPS - 1;
  const byCode = new Map(e.map((x) => [x.country, x]));
  const groups = Array.from({ length: GROUPS }, (_, g) => {
    const rows = e.filter((x) => groupOf(x.value) === g);
    return { g, from: rows[0]?.value, to: rows.at(-1)?.value, n: rows.length };
  });
  const fmt = (v: number) => formatValue(r, v);

  // Country names sit on the map where they fit, best-ranked first; crowded ones (Europe, the Gulf) stay hover-only.
  const anchored = e.flatMap((x) => {
    const c = countryCoords(x.country);
    const p = c && projectPoint(c.lat, c.lng);
    return p ? [{ x, p }] : [];
  });
  const sides = placeLabels(
    anchored.map(({ x, p }) => ({ x: p[0], y: p[1], r: 0, text: x.name })),
    { w: MAP_W, h: MAP_H },
    { hideCrowded: true },
  );

  return (
    <figure className="rank-map">
      <div
        className="rank-map-plot"
        role="img"
        aria-label={`World map of ${r.title}: ${e[0].name} ranks first, ${e[1].name} second, ${e[2].name} third.`}
      >
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true">
          {mapShapes().map((s) => {
            const x = s.code ? byCode.get(s.code) : undefined;
            const path = (
              <path
                d={s.d}
                className={x ? `s${groupOf(x.value)}` : "none"}
                data-tip={x ? `${x.name}: ${fmt(x.value)} (#${x.rank})` : undefined}
              />
            );
            return x ? (
              <Link key={s.name} href={`/country/${s.code}`} prefetch={false} aria-label={`${x.name}: ${fmt(x.value)} (#${x.rank})`}>
                {path}
              </Link>
            ) : (
              <g key={s.name}>{path}</g>
            );
          })}
        </svg>
        {anchored.map(({ x, p }, i) =>
          sides[i] ? (
            <span key={x.country} className="map-anchor" style={{ left: `${(p[0] / MAP_W) * 100}%`, top: `${(p[1] / MAP_H) * 100}%` }}>
              <span className={`map-name ${sides[i]}`}>{x.name}</span>
            </span>
          ) : null,
        )}
      </div>
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

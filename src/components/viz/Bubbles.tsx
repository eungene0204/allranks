import Link from "next/link";
import { countryInfo, countryCoords } from "@/lib/data";
import { ranked } from "@/lib/format";
import { placeLabels } from "@/lib/labels";
import { mapAssetUrl, mapShapes, MAP_H, MAP_W, projectPoint } from "@/lib/map";
import type { Ranking } from "@/lib/types";
import type { CSSProperties } from "react";

/** Lists of things that each sit in a country (companies, cities, clusters…): one bubble per country, sized by how many entries it has. */
export default function Bubbles({ ranking: r }: { ranking: Ranking }) {
  const e = ranked(r);
  const byCountry = new Map<string, typeof e>();
  for (const x of e) byCountry.set(x.country, [...(byCountry.get(x.country) ?? []), x]);
  const dots = [...byCountry]
    .flatMap(([code, xs]) => {
      const c = countryCoords(code);
      const p = c && projectPoint(c.lat, c.lng);
      return p ? [{ code, xs, p, name: countryInfo(code)?.name ?? code, flag: xs[0].flag }] : [];
    })
    .sort((a, b) => b.xs.length - a.xs.length || a.name.localeCompare(b.name));
  if (dots.length < 2) return null;
  const radius = (n: number) => 5 + 7 * Math.sqrt(n);
  const lead = dots.slice(0, 6);
  const sides = placeLabels(
    dots.map((d) => ({ x: d.p[0], y: d.p[1], r: radius(d.xs.length), text: `${d.flag} ${d.name} · ${d.xs.length}` })),
    { w: MAP_W, h: MAP_H },
  );

  return (
    <figure className="viz bubbles">
      {/* Dots are HTML (percent-positioned) so names and tooltips stay readable when the map scales down. */}
      <div className="bb-plot" role="img" aria-label={`Map of where the ${e.length} entries of ${r.title} are: ${lead.map((d) => `${d.name} ${d.xs.length}`).join(", ")}.`}>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true">
          {mapShapes().map((s, index) => (
            <use key={s.name} href={`${mapAssetUrl()}#shape-${index}`} className="none" />
          ))}
        </svg>
        {dots.map((d, i) => {
          const [x, y] = d.p;
          const size = (2 * radius(d.xs.length)) / MAP_W * 100;
          const tip = `${d.flag} ${d.name}: ${d.xs.length} ${d.xs.length === 1 ? "entry" : "entries"} — ${d.xs.slice(0, 6).map((v) => v.name).join(", ")}${d.xs.length > 6 ? "…" : ""}`;
          return (
            <Link
              key={d.code}
              className="bb-dot"
              href={`/country/${d.code}`}
              prefetch={false}
              data-tip={tip}
              aria-label={tip}
              style={{ left: `${(x / MAP_W) * 100}%`, top: `${(y / MAP_H) * 100}%`, width: `${size}%`, "--z": dots.length - i } as CSSProperties}
            >
              <span className={`map-name ${sides[i]}`}>
                {d.flag} {d.name} · {d.xs.length}
              </span>
            </Link>
          );
        })}
      </div>
      <figcaption className="map-legend">
        {lead.map((d) => (
          <Link key={d.code} className="map-key" href={`/country/${d.code}`} prefetch={false}>
            <span>{d.xs[0].flag}</span> {d.name} · {d.xs.length}
          </Link>
        ))}
        <span className="map-key">Bubble area = number of entries in the list</span>
      </figcaption>
    </figure>
  );
}

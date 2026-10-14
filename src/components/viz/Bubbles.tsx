import Link from "next/link";
import { countryInfo, countryCoords } from "@/lib/data";
import { ranked } from "@/lib/format";
import { mapShapes, MAP_H, MAP_W, projectPoint } from "@/lib/map";
import type { Ranking } from "@/lib/types";

/** Lists of things that each sit in a country (companies, cities, clusters…): one bubble per country, sized by how many entries it has. */
export default function Bubbles({ ranking: r }: { ranking: Ranking }) {
  const e = ranked(r);
  const byCountry = new Map<string, typeof e>();
  for (const x of e) byCountry.set(x.country, [...(byCountry.get(x.country) ?? []), x]);
  const dots = [...byCountry]
    .flatMap(([code, xs]) => {
      const c = countryCoords(code);
      const p = c && projectPoint(c.lat, c.lng);
      return p ? [{ code, xs, p, name: countryInfo(code)?.name ?? code }] : [];
    })
    .sort((a, b) => b.xs.length - a.xs.length || a.name.localeCompare(b.name));
  if (dots.length < 2) return null;
  const radius = (n: number) => 5 + 7 * Math.sqrt(n);
  const lead = dots.slice(0, 6);

  return (
    <figure className="viz bubbles">
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label={`Map of where the ${e.length} entries of ${r.title} are: ${lead.map((d) => `${d.name} ${d.xs.length}`).join(", ")}.`}>
        {mapShapes().map((s) => (
          <path key={s.name} d={s.d} className="none" />
        ))}
        {[...dots].reverse().map((d) => (
          <Link key={d.code} href={`/country/${d.code}`} prefetch={false}>
            <circle cx={d.p[0]} cy={d.p[1]} r={radius(d.xs.length)}>
              <title>{`${d.name}: ${d.xs.length} ${d.xs.length === 1 ? "entry" : "entries"} — ${d.xs.slice(0, 6).map((x) => x.name).join(", ")}${d.xs.length > 6 ? "…" : ""}`}</title>
            </circle>
          </Link>
        ))}
      </svg>
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

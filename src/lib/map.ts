import "server-only";
import { createHash } from "node:crypto";
import { geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { feature } from "topojson-client";
import countries110 from "world-atlas/countries-110m.json";
import mapCodes from "../../data/map-codes.json";

export const MAP_W = 960;
export const MAP_H = 480;

export type MapShape = { code: string; name: string; d: string };

// Projected once per server process; every ranking page reuses the same outlines.
let shapes: MapShape[] | undefined;
let projection: GeoProjection | undefined;

/** World outlines (110m), projected to a Natural Earth map and tagged with the ISO code of each country. */
export function mapShapes(): MapShape[] {
  if (shapes) return shapes;
  const topo = countries110 as unknown as Topology;
  const fc = feature(topo, topo.objects.countries as GeometryCollection) as FeatureCollection<Geometry, { name?: string }>;
  const land = { ...fc, features: fc.features.filter((f) => f.properties?.name !== "Antarctica") };
  projection = geoNaturalEarth1().fitExtent([[4, 4], [MAP_W - 4, MAP_H - 4]], land);
  const path = geoPath(projection).digits(0);
  const codes = mapCodes as Record<string, string>;
  shapes = land.features.flatMap((f) => {
    const name = f.properties?.name ?? "";
    const d = path(f);
    return d ? [{ code: codes[name] ?? "", name, d }] : [];
  });
  return shapes;
}

/** Pixel position (in the MAP_W × MAP_H box) of a latitude/longitude, or null when it falls off the map. */
export function projectPoint(lat: number, lng: number): [number, number] | null {
  mapShapes();
  return projection?.([lng, lat]) ?? null;
}

let assetUrl: string | undefined;

/** Change the URL whenever shared geometry changes, so browsers can cache it safely. */
export function mapAssetUrl(): string {
  return assetUrl ??= `/maps/world.svg?v=${createHash("sha256").update(JSON.stringify(mapShapes())).digest("hex").slice(0, 16)}`;
}

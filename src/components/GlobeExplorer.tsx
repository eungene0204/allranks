"use client";

import { geoBounds, geoCentroid, geoDistance, geoGraticule, geoOrthographic, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { GeometryCollection, Topology } from "topojson-specification";
import { feature } from "topojson-client";
import countries110 from "world-atlas/countries-110m.json";
import type { CountrySummary } from "@/lib/types";
import Mark from "./Mark";

const ACCENT = "#e4572e";

type Palette = { ocean: [string, string, string]; land: string[]; border: string; grid: string; glow: string };

// Muted "political map" colours, like the countries on a desk globe.
const PALETTES: Record<"light" | "dark", Palette> = {
  light: {
    ocean: ["#5fa8dc", "#2f78bd", "#14487f"],
    land: ["#ead9a3", "#c8dba0", "#f1c99b", "#dbb9d6", "#a9d6c8", "#f1b9b2"],
    border: "rgba(60,45,20,.45)",
    grid: "rgba(255,255,255,.22)",
    glow: "rgba(110,175,235,.55)",
  },
  dark: {
    ocean: ["#2c5b92", "#143a68", "#0a2142"],
    land: ["#a39565", "#82976a", "#a98a66", "#8c718f", "#6c9c90", "#a97a78"],
    border: "rgba(0,0,0,.45)",
    grid: "rgba(255,255,255,.12)",
    glow: "rgba(70,120,190,.5)",
  },
};

const TIP_LINES = 6; // rankings listed in a flag's hover card
const TILT = (23.4 * Math.PI) / 180; // axial tilt of a real desk globe
const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const LABEL_ZOOM = 1.35; // country names appear once the user has zoomed in this far
const GLOBE_FILL = 0.45; // sphere radius as a fraction of the canvas width at zoom 1
const DEG = Math.PI / 180;

/** Larger coastline data is loaded on demand; 110m is plenty until the user zooms in. */
type Land = Feature<Geometry, { name?: string }> & { id?: string | number };
type Shape = { f: Land; name: string; fill: number; center: [number, number]; radius: number };
const toShapes = (topo: unknown): Shape[] => {
  const t = topo as Topology;
  const fc = feature(t, t.objects.countries as GeometryCollection) as FeatureCollection;
  return (fc.features as Land[]).map((f) => {
    // Centre + angular radius let the draw loop skip countries that are off the visible cap.
    const center = geoCentroid(f);
    const [[w, s], [e, n]] = geoBounds(f);
    const radius = Math.max(geoDistance(center, [w, s]), geoDistance(center, [e, n]), geoDistance(center, [w, n]), geoDistance(center, [e, s]));
    return { f, name: f.properties?.name ?? "", fill: hash(f.id ?? f.properties?.name), center, radius };
  });
};

const hash = (v: string | number | undefined) => {
  let h = 0;
  for (const ch of String(v ?? "")) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
};

/** Shortest signed distance between two angles. */
const angleDiff = (from: number, to: number) => {
  const d = (to - from) % (Math.PI * 2);
  return d > Math.PI ? d - Math.PI * 2 : d < -Math.PI ? d + Math.PI * 2 : d;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export type GlobeCountry = Omit<CountrySummary, "appearances" | "regional"> & {
  appearances: CountrySummary["appearances"];
  appearanceCount: number;
  leads: CountrySummary["appearances"];
  leadCount: number;
  regionalCount: number;
  regionalIcons: string[];
};

export default function GlobeExplorer({ countries }: { countries: GlobeCountry[] }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [dark, setDark] = useState(false);

  // Mutable view state, read every frame without re-rendering. lng/lat (radians) is the point facing the viewer.
  const view = useRef({
    lng: 0, lat: 0.3, zoom: 1, zoomTarget: 1,
    target: null as [number, number] | null,
    /** Geographic point (deg) that must stay under screen position (sx, sy) while zooming. */
    anchor: null as { geo: [number, number]; sx: number; sy: number } | null,
    dragging: false, lastX: 0, lastY: 0, spin: true, dirty: true,
    dark: false, selected: null as string | null,
  });

  // Keep the render loop in sync with React state.
  useEffect(() => {
    view.current.dark = dark;
    view.current.selected = selected;
    view.current.dirty = true;
  }, [dark, selected]);

  // Draw the globe and drive the interaction loop.
  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
    view.current.dark = mq.matches;

    let size = 1;
    const resize = () => {
      size = Math.max(wrap.clientWidth, 1);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      view.current.dirty = true;
    };
    resize();

    const projection = geoOrthographic().clipAngle(90).clipExtent([[0, 0], [size, size]]).precision(0.7);
    const path = geoPath(projection, ctx);
    const aim = () => {
      const v = view.current;
      projection.translate([size / 2, size / 2]).scale(size * GLOBE_FILL * v.zoom).rotate([-v.lng / DEG, -v.lat / DEG, -TILT / DEG]);
    };
    const graticule = geoGraticule().step([15, 15])();
    const coarse = toShapes(countries110);
    let land = coarse;
    let disposed = false;
    // Sharper borders for when the user zooms in; loaded in the background.
    let detailed: Shape[] | null = null;
    import("world-atlas/countries-50m.json").then((m) => {
      if (disposed) return;
      detailed = toShapes(m.default);
      view.current.dirty = true;
    }).catch(() => { /* Keep the coarse map if the detail chunk fails to load. */ });

    const markerState = countries.map(() => ({ visible: false, hit: 0 }));
    const labelWidths = new Map<string, number>();
    const labelOrder = new WeakMap<Shape[], Shape[]>();
    const draw = () => {
      const v = view.current;
      const pal = PALETTES[v.dark ? "dark" : "light"];
      const R = size * GLOBE_FILL * v.zoom;
      const cx = size / 2;
      const cy = size / 2;
      const moving = v.dragging || Math.abs(v.zoomTarget - v.zoom) > 0.001 || !!v.target || (v.spin && !reduceMotion);
      // Detailed coastlines are useful at rest, but too expensive to reproject during a gesture.
      land = detailed && v.zoom > 1.6 && !moving ? detailed : coarse;
      projection.clipExtent([[0, 0], [size, size]]).precision(moving ? 1.2 : 0.5);
      aim();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      // Atmosphere
      const glow = ctx.createRadialGradient(cx, cy, R * 0.97, cx, cy, R * 1.1);
      glow.addColorStop(0, pal.glow);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Ocean, lit from the upper left
      const sea = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R);
      sea.addColorStop(0, pal.ocean[0]);
      sea.addColorStop(0.55, pal.ocean[1]);
      sea.addColorStop(1, pal.ocean[2]);
      ctx.fillStyle = sea;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Graticule
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Countries
      ctx.lineWidth = 0.6;
      ctx.lineJoin = "round";
      ctx.strokeStyle = pal.border;
      // Angular half-size of the part of the sphere that is actually on the canvas.
      const cap = Math.min(Math.PI / 2, Math.asin(Math.min(1, 0.72 / (GLOBE_FILL * v.zoom))));
      const here: [number, number] = [v.lng / DEG, v.lat / DEG];
      for (const { f, fill, center, radius } of land) {
        if (geoDistance(center, here) - radius > cap) continue;
        ctx.beginPath();
        path(f);
        ctx.fillStyle = pal.land[fill % pal.land.length];
        ctx.fill();
        ctx.stroke();
      }

      // Limb darkening + glossy highlight give the sphere its volume
      const shade = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.4, cx, cy, R);
      shade.addColorStop(0, "rgba(0,0,0,0)");
      shade.addColorStop(0.75, "rgba(0,10,30,.18)");
      shade.addColorStop(1, "rgba(0,10,30,.55)");
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      const shine = ctx.createRadialGradient(cx - R * 0.42, cy - R * 0.46, 0, cx - R * 0.42, cy - R * 0.46, R * 0.55);
      shine.addColorStop(0, "rgba(255,255,255,.38)");
      shine.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = shine;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      const flagScale = Math.pow(v.zoom, 0.6);

      // Country names, once zoomed in. Biggest countries claim space first; smaller ones appear as there is room.
      if (v.zoom >= LABEL_ZOOM) {
        const fontPx = 11 + Math.min(v.zoom, 4) * 1.5;
        ctx.font = `600 ${fontPx}px system-ui, -apple-system, "Segoe UI", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
        ctx.lineWidth = 3.5;
        const taken: [number, number, number, number][] = [];
        const labelFade = clamp((v.zoom - LABEL_ZOOM) / 0.4, 0, 1);
        let order = labelOrder.get(land);
        if (!order) {
          order = land.filter((s) => s.name).sort((a, b) => b.radius - a.radius);
          labelOrder.set(land, order);
        }
        for (const { name, center, radius } of order) {
          if (geoDistance(center, here) >= 1.35) continue;
          const p = projection(center);
          if (!p || p[0] < 0 || p[0] > size || p[1] < 0 || p[1] > size) continue;
          const widthKey = `${fontPx.toFixed(1)}:${name}`;
          let w = labelWidths.get(widthKey);
          if (w === undefined) {
            w = ctx.measureText(name).width;
            if (labelWidths.size > 4000) labelWidths.clear();
            labelWidths.set(widthKey, w);
          }
          if (radius * R * 2 < w * 0.7) continue; // country too small on screen to carry its name yet
          const x = p[0];
          const y = p[1] + fontPx * 0.6 + 7 * flagScale; // sits just under the country's flag
          const box: [number, number, number, number] = [x - w / 2 - 3, y - fontPx / 2 - 1, x + w / 2 + 3, y + fontPx / 2 + 1];
          if (taken.some((t) => box[0] < t[2] && box[2] > t[0] && box[1] < t[3] && box[3] > t[1])) continue;
          taken.push(box);
          ctx.globalAlpha = labelFade * clamp((1.35 - geoDistance(center, here)) / 0.3, 0, 1);
          ctx.strokeStyle = v.dark ? "rgba(10,20,40,.8)" : "rgba(255,255,255,.85)";
          ctx.fillStyle = v.dark ? "#f2f5fb" : "#1d2433";
          ctx.strokeText(name, x, y);
          ctx.fillText(name, x, y);
        }
        ctx.globalAlpha = 1;
      }

      // Markers: each ranked country is drawn as its flag; the hit buttons live in the DOM.
      type Flag = { i: number; c: GlobeCountry; x: number; y: number; s: number; prio: number };
      const flags: Flag[] = [];
      countries.forEach((c, i) => {
        const btn = hitRefs.current[i];
        const d = geoDistance([c.lng, c.lat], here);
        const p = d < Math.PI / 2 - 0.03 ? projection([c.lng, c.lat]) : null;
        const onCanvas = !!p && p[0] > 0 && p[0] < size && p[1] > 0 && p[1] < size;
        if (btn && onCanvas) {
          btn.style.left = `${p![0]}px`;
          btn.style.top = `${p![1]}px`;
        }
        if (!onCanvas) return;
        const sel = c.flag === v.selected;
        // Podium countries get bigger flags; flags shrink toward the limb like the land they sit on.
        const s = (c.top3 > 0 ? 13 + Math.min(c.top3, 5) * 1.2 : 11) * flagScale * (sel ? 1.5 : 1) * (0.6 + 0.4 * Math.cos(d));
        flags.push({ i, c, x: p![0], y: p![1], s, prio: sel ? 3 : c.firsts > 0 ? 2 : c.top3 > 0 ? 1 : 0 });
      });
      // Most important flags claim space first; crowded ones (Europe, Pacific islands) appear as you zoom in.
      flags.sort((a, b) => b.prio - a.prio || b.c.top3 - a.c.top3);
      const used: [number, number, number, number][] = [];
      const shown: Flag[] = [];
      for (const f of flags) {
        const h = f.s * 0.55;
        const box: [number, number, number, number] = [f.x - h, f.y - h, f.x + h, f.y + h];
        if (f.prio < 2 && used.some((u) => box[0] < u[2] && box[2] > u[0] && box[1] < u[3] && box[3] > u[1])) continue;
        used.push(box);
        shown.push(f);

      }
      const visible = new Set(shown.map((f) => f.i));
      countries.forEach((_, i) => {
        const btn = hitRefs.current[i];
        if (!btn || markerState[i].visible === visible.has(i)) return;
        markerState[i].visible = visible.has(i);
        btn.style.setProperty("--vis", visible.has(i) ? "1" : "0");
        btn.tabIndex = visible.has(i) ? 0 : -1;
        btn.setAttribute("aria-hidden", String(!visible.has(i)));
      });
      for (const f of shown) {
        const hit = Math.round(Math.max(24, f.s * 1.7));
        if (markerState[f.i].hit === hit) continue;
        markerState[f.i].hit = hit;
        hitRefs.current[f.i]?.style.setProperty("--hit", `${hit}px`);
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const f of shown.reverse()) {
        const hot = f.prio >= 2;
        if (hot) {
          // Accent ring marks countries that rank #1 somewhere (and the selected one).
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.s * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = "#fff";
          ctx.fill();
          ctx.lineWidth = f.prio === 3 ? 3 : 2;
          ctx.strokeStyle = ACCENT;
          ctx.stroke();
        }
        ctx.font = `${hot ? f.s * 0.85 : f.s}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
        ctx.shadowColor = "rgba(0,0,0,.45)";
        ctx.shadowBlur = hot ? 0 : 3;
        ctx.shadowOffsetY = hot ? 0 : 1;
        ctx.fillStyle = "#000";
        ctx.fillText(f.c.flag, f.x, f.y + f.s * 0.06);
        ctx.shadowColor = "transparent";
      }
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Don't burn CPU redrawing a globe that is scrolled out of view.
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    io.observe(wrap);

    let raf = 0;
    let previousTime = 0;
    const tick = (time: number) => {
      raf = requestAnimationFrame(tick);
      const dt = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 1 / 60;
      previousTime = time;
      if (!onScreen || document.hidden) return;
      const turnEase = 1 - Math.exp(-5 * dt);
      const zoomEase = 1 - Math.exp(-12 * dt);
      const v = view.current;
      if (!v.dragging) {
        if (v.target) {
          v.lng += angleDiff(v.lng, v.target[0]) * turnEase;
          v.lat += (v.target[1] - v.lat) * turnEase;
          if (Math.abs(angleDiff(v.lng, v.target[0])) < 0.0001 && Math.abs(v.target[1] - v.lat) < 0.0001) {
            [v.lng, v.lat] = v.target;
            v.target = null;
          }
          v.dirty = true;
        } else if (v.spin && !reduceMotion) {
          v.lng += 0.15 * dt / Math.sqrt(v.zoom);
          v.dirty = true;
        }
      }
      if (Math.abs(v.zoomTarget - v.zoom) > 0.001) {
        v.zoom += (v.zoomTarget - v.zoom) * zoomEase;
        v.dirty = true;
        // Zoom around the cursor: turn the globe until the anchored point is back under it.
        if (v.anchor && !v.target && !v.dragging) {
          const R = size * GLOBE_FILL * v.zoom;
          for (let i = 0; i < 4; i++) {
            aim();
            const p = projection(v.anchor.geo);
            if (!p) break;
            const dx = v.anchor.sx - p[0];
            const dy = v.anchor.sy - p[1];
            v.lng -= (dx * Math.cos(TILT) + dy * Math.sin(TILT)) / R;
            v.lat = clamp(v.lat + (-dx * Math.sin(TILT) + dy * Math.cos(TILT)) / R, -1.3, 1.3);
          }
        }
      } else {
        if (v.zoom !== v.zoomTarget) v.dirty = true;
        v.zoom = v.zoomTarget;
        v.anchor = null;
      }
      if (v.dirty) {
        v.dirty = false;
        draw();
      }
    };
    raf = requestAnimationFrame(tick);

    // Scrolling over the globe (mouse wheel or two-finger trackpad swipe) zooms it; scroll up = zoom in.
    // Once fully zoomed out, scrolling down falls through so the page can still be scrolled.
    const onWheel = (e: WheelEvent) => {
      const v = view.current;
      v.spin = false;
      v.target = null;
      const px = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
      if (px > 0 && v.zoomTarget <= MIN_ZOOM) return;
      e.preventDefault();
      const next = v.zoomTarget * Math.exp(-clamp(px, -120, 120) * (e.ctrlKey ? 0.015 : 0.006));
      v.zoomTarget = clamp(next, MIN_ZOOM, MAX_ZOOM);

      // Remember which spot of the globe is under the cursor (if it is over the globe at all).
      const rect = wrap.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      aim();
      const onGlobe = Math.hypot(sx - size / 2, sy - size / 2) < size * GLOBE_FILL * v.zoom * 0.97;
      const geo = onGlobe ? projection.invert?.([sx, sy]) : null;
      v.anchor = geo ? { geo: geo as [number, number], sx, sy } : null;
    };
    let gestureStart = 1;
    const onGestureStart = (e: Event) => {
      e.preventDefault();
      view.current.spin = false;
      view.current.target = null;
      view.current.anchor = null;
      gestureStart = view.current.zoomTarget;
    };
    const onGestureChange = (e: Event) => {
      e.preventDefault();
      view.current.zoomTarget = clamp(gestureStart * (e as unknown as { scale: number }).scale, MIN_ZOOM, MAX_ZOOM);
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });
    wrap.addEventListener("gesturestart", onGestureStart);
    wrap.addEventListener("gesturechange", onGestureChange);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const onTheme = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", onTheme);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mq.removeEventListener("change", onTheme);
      wrap.removeEventListener("wheel", onWheel);
      wrap.removeEventListener("gesturestart", onGestureStart);
      wrap.removeEventListener("gesturechange", onGestureChange);
    };
  }, [countries]);

  function select(flag: string | null) {
    const c = countries.find((x) => x.flag === flag);
    setSelected(c ? c.flag : null);
    const v = view.current;
    v.selected = c ? c.flag : null;
    v.dirty = true;
    v.target = c ? [c.lng * DEG, c.lat * DEG] : null;
    v.spin = false; // any interaction ends the idle auto-rotation for good
    if (c) router.prefetch(`/country/${c.code}`);
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const v = view.current;
    v.spin = false; // the first click or drag anywhere on the globe stops the idle auto-rotation for good
    if ((e.target as HTMLElement).closest(".marker-hit")) return; // let the click through
    select(null);
    // Clear keyboard/touch focus too, so a previously focused flag cannot keep its tooltip open.
    hitRefs.current.forEach((marker) => marker?.blur());
    v.dragging = true;
    v.anchor = null;
    v.lastX = e.clientX;
    v.lastY = e.clientY;
    v.target = null;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const v = view.current;
    if (!v.dragging) return;
    // Undo the globe's axial tilt so dragging follows the finger, then scale by the on-screen radius.
    const dx = e.clientX - v.lastX;
    const dy = e.clientY - v.lastY;
    const px = dx * Math.cos(TILT) + dy * Math.sin(TILT);
    const py = -dx * Math.sin(TILT) + dy * Math.cos(TILT);
    const radius = wrapRef.current!.clientWidth * GLOBE_FILL * v.zoom;
    v.lng -= px / radius;
    v.lat = clamp(v.lat + py / radius, -1.3, 1.3);
    v.lastX = e.clientX;
    v.lastY = e.clientY;
    v.dirty = true;
  };
  const onPointerUp = () => {
    view.current.dragging = false;
    view.current.dirty = true;
  };

  return (
    <section className="globe-section">
      <div
        className="globe-wrap"
        ref={wrapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="globe-canvas">
          <canvas ref={canvasRef} aria-label="Interactive globe showing countries that appear in rankings" role="img" />
        </div>
        {countries.map((c, i) => {
          const leads = c.leads;
          const shown = c.appearances.slice(0, TIP_LINES);
          return (
            <Link
              key={c.flag}
              href={`/country/${c.code}`}
              prefetch={false}
              onMouseEnter={() => { setHovered(c.flag); router.prefetch(`/country/${c.code}`); }}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => { setHovered(c.flag); router.prefetch(`/country/${c.code}`); }}
              onBlur={() => setHovered(null)}
              className={`marker-hit ${c.flag === selected ? "on" : ""} ${c.firsts ? "has-lead" : ""}`}
              aria-label={`${c.name}: ${c.appearanceCount} rankings${c.firsts ? `, #1 in ${leads.map((l) => l.title).join(", ")}` : ""}. Open details`}
              ref={(el) => {
                hitRefs.current[i] = el;
              }}
            >
              {c.firsts > 0 && (
                <span className="badges">
                  {leads.slice(0, 3).map((l) => (
                    <span className="badge" key={l.id}>
                      <Mark icon={l.icon} logo={l.logo} />
                    </span>
                  ))}
                  {c.leadCount > 3 && <span className="badge more">+{c.leadCount - 3}</span>}
                </span>
              )}
              {(hovered === c.flag || selected === c.flag) && <span className="tip">
                <b>
                  {c.flag} {c.name}
                </b>
                <span className="tip-sub">
                  {c.firsts} × #1 · {c.top3} × top 3 · {c.appearanceCount} ranking{c.appearanceCount === 1 ? "" : "s"}
                </span>
                {shown.map((a) => (
                  <span className="tip-line" key={a.id}>
                    <Mark icon={a.icon} logo={a.logo} /> <em>#{a.rank}</em>
                    <span className="tip-title">
                      {a.title}
                      {a.entry !== c.name && ` — ${a.entry}`}
                    </span>
                    <span className="tip-val">{a.value}</span>
                  </span>
                ))}
                {c.appearanceCount > shown.length && <span className="tip-sub">+{c.appearanceCount - shown.length} more rankings</span>}
                {c.regionalCount > 0 && (
                  <span className="tip-sub">
                    {c.regionalCount} rankings only in {c.name}: {c.regionalIcons.join(" ")}
                    {c.regionalCount > 8 && " …"}
                  </span>
                )}
                <span className="tip-cta">Click for full details →</span>
              </span>}
            </Link>
          );
        })}
      </div>

    </section>
  );
}

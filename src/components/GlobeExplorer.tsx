"use client";

import createGlobe, { type COBEOptions, type Globe, type Marker } from "cobe";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CountrySummary } from "@/lib/types";
import Mark from "./Mark";
import RankBadge from "./RankBadge";

type RGB = [number, number, number];

const ACCENT: RGB = [0.894, 0.341, 0.18];

type Theme = Pick<COBEOptions, "dark" | "diffuse" | "mapBrightness" | "baseColor" | "glowColor" | "markerColor"> & { plain: RGB };

const THEMES: Record<"light" | "dark", Theme> = {
  light: { dark: 0, diffuse: 1.3, mapBrightness: 6, baseColor: [1, 1, 1], glowColor: [0.94, 0.94, 0.94], markerColor: ACCENT, plain: [0.15, 0.15, 0.18] },
  dark: { dark: 1, diffuse: 1.1, mapBrightness: 5, baseColor: [0.32, 0.32, 0.37], glowColor: [0.14, 0.14, 0.17], markerColor: ACCENT, plain: [0.85, 0.85, 0.9] },
};

/** Theme settings without our own `plain` marker colour. */
const themeOptions = (theme: "light" | "dark") => {
  const { plain: _plain, ...opts } = THEMES[theme];
  return opts;
};

const CHIP_LIMIT = 24;

/** cobe's phi/theta that bring a lat/lng to the front of the globe. */
const toAngles = (lat: number, lng: number): [number, number] => [
  Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
  (lat * Math.PI) / 180,
];

/** Shortest signed distance between two angles. */
const angleDiff = (from: number, to: number) => {
  const d = (to - from) % (Math.PI * 2);
  return d > Math.PI ? d - Math.PI * 2 : d < -Math.PI ? d + Math.PI * 2 : d;
};

export default function GlobeExplorer({ countries }: { countries: CountrySummary[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<Globe | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [allChips, setAllChips] = useState(false);

  // Mutable animation state, read every frame without re-rendering.
  const anim = useRef({ phi: 0, theta: 0.25, target: null as [number, number] | null, dragging: false, lastX: 0, lastY: 0, spin: true });

  const markersFor = (theme: "light" | "dark", sel: string | null): Marker[] =>
    countries.map((c, i) => ({
      id: `c${i}`, // cobe exposes --cobe-c{i} anchors that the hit buttons below attach to
      location: [c.lat, c.lng],
      // Podium countries get bigger dots; the rest stay small so ~200 countries don't drown the globe.
      size: (c.top3 > 0 ? 0.035 + Math.min(c.top3, 5) * 0.01 : 0.022) * (c.flag === sel ? 1.7 : 1),
      color: c.flag === sel || c.firsts > 0 ? ACCENT : THEMES[theme].plain,
    }));

  // Create the globe once.
  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const theme = mq.matches ? "dark" : "light";
    setDark(mq.matches);

    // cobe v2 has no render loop: it draws on every update(). Sizes are CSS px (it applies the dpr itself).
    const size = () => Math.max(wrap.clientWidth, 1);

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size(),
      height: size(),
      phi: anim.current.phi,
      theta: anim.current.theta,
      mapSamples: 16000,
      markerElevation: 0.02,
      ...themeOptions(theme),
      markers: markersFor(theme, null),
    });
    globeRef.current = globe;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Don't burn CPU/GPU redrawing a globe that is scrolled out of view.
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => (onScreen = entry.isIntersecting));
    io.observe(wrap);

    let raf = 0;
    const tick = () => {
      if (!onScreen) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const a = anim.current;
      if (!a.dragging) {
        if (a.target) {
          a.phi += angleDiff(a.phi, a.target[0]) * 0.08;
          a.theta += (a.target[1] - a.theta) * 0.08;
        } else if (a.spin && !reduceMotion) {
          a.phi += 0.003;
        }
      }
      globe.update({ phi: a.phi, theta: a.theta });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => globe.update({ width: size(), height: size() }));
    ro.observe(wrap);
    const onTheme = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", onTheme);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mq.removeEventListener("change", onTheme);
      globe.destroy();
      globeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-style / re-mark when the theme or selection changes.
  useEffect(() => {
    const theme = dark ? "dark" : "light";
    globeRef.current?.update({ ...themeOptions(theme), markers: markersFor(theme, selected) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark, selected]);

  function select(flag: string | null) {
    const c = countries.find((x) => x.flag === flag);
    setSelected(c ? c.flag : null);
    anim.current.target = c ? toAngles(c.lat, c.lng) : null;
    anim.current.spin = !c;
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(".marker-hit")) return; // let the click through
    const a = anim.current;
    a.dragging = true;
    a.lastX = e.clientX;
    a.lastY = e.clientY;
    a.target = null;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const a = anim.current;
    if (!a.dragging) return;
    a.phi += (e.clientX - a.lastX) / 200;
    a.theta = Math.max(-1.2, Math.min(1.2, a.theta + (e.clientY - a.lastY) / 200));
    a.lastX = e.clientX;
    a.lastY = e.clientY;
  };
  const onPointerUp = () => {
    anim.current.dragging = false;
  };

  const current = countries.find((c) => c.flag === selected);

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
        {/* cobe appends its anchor elements to the canvas's parent, so keep that parent React-free. */}
        <div className="globe-canvas">
          <canvas ref={canvasRef} aria-label="Interactive globe showing countries that appear in rankings" role="img" />
        </div>
        {countries.map((c, i) => {
          const leads = c.appearances.filter((a) => a.rank === 1);
          const tip = leads.length ? leads : c.appearances.slice(0, 1);
          return (
            <button
              key={c.flag}
              type="button"
              className={`marker-hit ${c.flag === selected ? "on" : ""} ${leads.length ? "has-lead" : ""}`}
              aria-label={`${c.name}${leads.length ? `: #1 in ${leads.map((l) => l.title).join(", ")}` : ""}`}
              style={{ positionAnchor: `--cobe-c${i}`, "--vis": `var(--cobe-visible-c${i}, 0)` } as React.CSSProperties}
              onClick={() => select(c.flag === selected ? null : c.flag)}
            >
              {leads.length > 0 && (
                <span className="badges">
                  {leads.slice(0, 3).map((l) => (
                    <span className="badge" key={l.id}>
                      <Mark icon={l.icon} logo={l.logo} />
                    </span>
                  ))}
                  {leads.length > 3 && <span className="badge more">+{leads.length - 3}</span>}
                </span>
              )}
              <span className="tip">
                <b>
                  {c.flag} {c.name}
                </b>
                {tip.map((a) => (
                  <span className="tip-line" key={a.id}>
                    <Mark icon={a.icon} logo={a.logo} /> <em>#{a.rank}</em> {a.title}
                    {a.entry !== c.name && ` — ${a.entry}`}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <p className="globe-hint">
        Badges show what a country ranks <b>#1</b> in &nbsp;·&nbsp; <span className="dot dot-plain" /> other ranked countries · drag to rotate
      </p>

      <div className="globe-panel">
        <div className="lb">
          <h2 className="section" style={{ marginTop: 0 }}>
            Country leaderboard
          </h2>
          <div className="table">
            <div className="row lb-head">
              <span>#</span>
              <span>Country</span>
              <span className="lb-num">#1s</span>
              <span className="lb-num">Top 3</span>
            </div>
            {countries.slice(0, 10).map((c, i) => (
              <button
                key={c.flag}
                type="button"
                className={`row lb-row ${c.flag === selected ? "selected" : ""}`}
                onClick={() => select(c.flag === selected ? null : c.flag)}
              >
                <RankBadge rank={i + 1} />
                <span className="name">
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                  <span className="mini-marks">
                    {c.appearances
                      .filter((a) => a.rank === 1)
                      .map((a) => (
                        <Mark key={a.id} icon={a.icon} logo={a.logo} />
                      ))}
                  </span>
                </span>
                <span className="lb-num">{c.firsts}</span>
                <span className="lb-num">{c.top3}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="detail">
          {current ? (
            <>
              <h3>
                {current.flag} {current.name}
              </h3>
              <p className="muted">
                {current.firsts} × #1 · {current.top3} × top 3 · {current.appearances.length} rankings
              </p>
              <ul>
                {current.appearances.map((a) => (
                  <li key={a.id}>
                    <RankBadge rank={a.rank} />
                    <Mark icon={a.icon} logo={a.logo} />
                    <span>
                      <Link href={`/ranking/${a.id}`}>{a.title}</Link>
                      <span className="muted">
                        {a.entry !== current.name && ` · ${a.entry}`}
                        {a.count > 1 && ` +${a.count - 1} more`}
                      </span>
                    </span>
                    <span className="v">{a.value}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="muted detail-empty">
              Select a country on the leaderboard or pick one below to spin the globe and see every ranking it appears in.
            </p>
          )}
        </div>
      </div>

      <div className="chips" aria-label="All countries">
        {(allChips ? countries : countries.slice(0, CHIP_LIMIT)).map((c) => (
          <button
            key={c.flag}
            type="button"
            className={`chip chip-btn ${c.flag === selected ? "on" : ""}`}
            onClick={() => select(c.flag === selected ? null : c.flag)}
          >
            {c.flag} {c.name}
          </button>
        ))}
        {countries.length > CHIP_LIMIT && (
          <button type="button" className="chip chip-btn" onClick={() => setAllChips((v) => !v)}>
            {allChips ? "Show fewer" : `Show all ${countries.length} countries`}
          </button>
        )}
      </div>
    </section>
  );
}

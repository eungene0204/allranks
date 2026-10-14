/** A 0–1 position scale for a number line, linear or logarithmic, plus tick values that suit it. */
export type Scale = { pos: (v: number) => number; ticks: number[]; log: boolean };

const niceStep = (raw: number) => {
  const p = 10 ** Math.floor(Math.log10(raw));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
};

export function makeScale(min: number, max: number): Scale {
  if (min > 0 && max / min >= 100) {
    const [a, b] = [Math.log10(min), Math.log10(max)];
    const ticks: number[] = [];
    for (let k = Math.ceil(a); k <= Math.floor(b); k++) ticks.push(10 ** k);
    if (ticks.length < 3) for (let k = Math.floor(a); k <= Math.ceil(b); k++) for (const m of [2, 5]) if (m * 10 ** k >= min && m * 10 ** k <= max) ticks.push(m * 10 ** k);
    return { pos: (v) => (Math.log10(v) - a) / (b - a), ticks: ticks.sort((p, q) => p - q), log: true };
  }
  const span = max - min || 1;
  const step = niceStep(span / 5);
  const ticks: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max + step * 1e-9; t += step) ticks.push(+t.toPrecision(12));
  return { pos: (v) => (v - min) / span, ticks, log: false };
}

/** Compact tick label: 1.2k, 3M… (axis ticks are never in the ranking's own unit, which would be too long). */
export const compact = (v: number) =>
  Math.abs(v) >= 1e6 ? `${+(v / 1e6).toPrecision(3)}M` : Math.abs(v) >= 1e4 ? `${+(v / 1e3).toPrecision(3)}k` : v.toLocaleString("en-US", { maximumFractionDigits: 2 });

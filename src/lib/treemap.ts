export type Tile<T> = { x: number; y: number; w: number; h: number; item: T };

/**
 * Squarified treemap (Bruls et al.): `items` must be sorted by value, largest first. Returns one rectangle per item inside a
 * w × h box, each with an area proportional to its value.
 */
export function squarify<T>(items: { value: number; item: T }[], W: number, H: number): Tile<T>[] {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!(total > 0)) return [];
  const scale = (W * H) / total;
  const out: Tile<T>[] = [];
  let x = 0, y = 0, w = W, h = H;
  let row: { area: number; item: T }[] = [];

  const worst = (areas: number[], side: number) => {
    const s = areas.reduce((p, q) => p + q, 0);
    return Math.max((side * side * Math.max(...areas)) / (s * s), (s * s) / (side * side * Math.min(...areas)));
  };
  const flush = () => {
    const s = row.reduce((p, q) => p + q.area, 0);
    if (w >= h) {
      // Lay the row out as a column on the left edge.
      const cw = s / h;
      let yy = y;
      for (const r of row) { out.push({ x, y: yy, w: cw, h: r.area / cw, item: r.item }); yy += r.area / cw; }
      x += cw; w -= cw;
    } else {
      const rh = s / w;
      let xx = x;
      for (const r of row) { out.push({ x: xx, y, w: r.area / rh, h: rh, item: r.item }); xx += r.area / rh; }
      y += rh; h -= rh;
    }
    row = [];
  };

  for (const { value, item } of items) {
    const area = value * scale;
    const side = Math.min(w, h);
    if (!row.length || worst([...row.map((r) => r.area), area], side) <= worst(row.map((r) => r.area), side)) row.push({ area, item });
    else { flush(); row.push({ area, item }); }
  }
  if (row.length) flush();
  return out;
}

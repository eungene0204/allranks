/** Where a name label sits relative to its mark: right, left, above or below. */
export type LabelSide = "r" | "l" | "t" | "b";

/** A mark to label. `x`/`y` are in nominal px of the plot (`bounds`), `r` is the mark's radius in the same px. */
export type LabelMark = { x: number; y: number; r: number; text: string };

type Box = { x0: number; y0: number; x1: number; y1: number };

const overlaps = (a: Box, b: Box) => a.x0 < b.x1 + 2 && b.x0 < a.x1 + 2 && a.y0 < b.y1 + 2 && b.y0 < a.y1 + 2;

/**
 * Greedy label placement. Marks come in priority order (first = most important, gets the best spot).
 * Each name tries right, left, above, below and takes the side that covers the fewest other names and marks.
 * With `hideCrowded`, a name that still collides with something stays hidden (null) instead of overlapping.
 * Text width is estimated (`charW` px per character) because the browser lays the text out later.
 */
export function placeLabels(
  marks: LabelMark[],
  bounds: { w: number; h: number },
  opts: { charW?: number; lineH?: number; hideCrowded?: boolean } = {},
): (LabelSide | null)[] {
  const { charW = 7, lineH = 14, hideCrowded = false } = opts;
  const circles: Box[] = marks.map((d) => ({ x0: d.x - d.r, y0: d.y - d.r, x1: d.x + d.r, y1: d.y + d.r }));
  const placed: Box[] = [];
  return marks.map((d, i) => {
    const w = d.text.length * charW + 6;
    const gap = d.r + 4;
    const boxes: [LabelSide, Box][] = [
      ["r", { x0: d.x + gap, y0: d.y - lineH / 2, x1: d.x + gap + w, y1: d.y + lineH / 2 }],
      ["l", { x0: d.x - gap - w, y0: d.y - lineH / 2, x1: d.x - gap, y1: d.y + lineH / 2 }],
      ["t", { x0: d.x - w / 2, y0: d.y - gap - lineH, x1: d.x + w / 2, y1: d.y - gap }],
      ["b", { x0: d.x - w / 2, y0: d.y + gap, x1: d.x + w / 2, y1: d.y + gap + lineH }],
    ];
    const others = circles.filter((_, j) => j !== i);
    // Off-plot sides count as collisions, as do other marks and names already placed.
    const cost = ([, b]: [LabelSide, Box]) =>
      (b.x0 < 0 || b.x1 > bounds.w || b.y0 < 0 || b.y1 > bounds.h ? 1 : 0) +
      others.filter((c) => overlaps(b, c)).length +
      placed.filter((q) => overlaps(b, q)).length;
    const pick = boxes.reduce((best, cur) => (cost(cur) < cost(best) ? cur : best));
    if (hideCrowded && cost(pick) > 0) return null;
    placed.push(pick[1]);
    return pick[0];
  });
}

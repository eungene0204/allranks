import { formatValue, ranked } from "@/lib/format";
import type { Ranking } from "@/lib/types";

// Groups of ranks, best first. Each group shares a shade (s0 strongest); everything below the last group is "the rest".
const GROUPS: [number, number][] = [[1, 1], [2, 3], [4, 10]];
const SHADES = ["s0", "s1", "s3"];

/** An additive total held by a few entries: 100 squares, one per percent, filled from the top rank down. */
export default function Waffle({ ranking: r }: { ranking: Ranking }) {
  const e = ranked(r).filter((x) => x.value > 0);
  if (e.length < 5) return null;
  const total = e.reduce((s, x) => s + x.value, 0);
  const sum = (from: number, to: number) => e.slice(from - 1, to).reduce((s, x) => s + x.value, 0);
  const groups = [
    ...GROUPS.filter(([from]) => from <= e.length).map(([from, to], i) => ({
      shade: SHADES[i],
      label: from === to ? `#${from} ${e[from - 1].name}` : `#${from}–${Math.min(to, e.length)}`,
      names: e.slice(from - 1, to).map((x) => x.name),
      value: sum(from, to),
    })),
  ];
  const restFrom = GROUPS.at(-1)![1] + 1;
  if (e.length >= restFrom) groups.push({ shade: "none", label: `The other ${e.length - restFrom + 1}`, names: [], value: sum(restFrom, e.length) });

  // Largest-remainder rounding so the squares always add up to exactly 100.
  const exact = groups.map((g) => (g.value / total) * 100);
  const cells = exact.map(Math.floor);
  let left = 100 - cells.reduce((s, c) => s + c, 0);
  [...exact.keys()].sort((a, b) => (exact[b] % 1) - (exact[a] % 1)).forEach((i) => { if (left-- > 0) cells[i]++; });
  const squares = groups.flatMap((g, gi) => Array.from({ length: cells[gi] }, () => g.shade));
  const top3 = (sum(1, 3) / total) * 100;

  return (
    <figure className="viz waffle">
      <div className="wf-head">
        <b>{Math.round(top3)}%</b>
        <span>of the world total is held by just {e[0].name}, {e[1].name} and {e[2].name}</span>
      </div>
      <div className="wf-body">
        <div className="wf-grid" role="img" aria-label={`Waffle chart: ${groups.map((g, i) => `${g.label} ${cells[i]}%`).join(", ")}.`}>
          {squares.map((shade, i) => (
            <i key={i} className={shade} />
          ))}
        </div>
        <ul className="wf-key">
          {groups.map((g, i) => (
            <li key={g.label}>
              <i className={g.shade} />
              <span>
                <b>{g.label}</b>
                {g.names.length > 1 && <span className="muted"> {g.names.join(", ")}</span>}
              </span>
              <span className="wf-pct">{cells[i]}%</span>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="viz-cap">
        Each square is 1% of the combined total of {formatValue(r, total)} ({e.length} entries), filled from the top-ranked entry down.
      </figcaption>
    </figure>
  );
}

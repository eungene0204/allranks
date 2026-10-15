import { formatValue, ranked } from "@/lib/format";
import type { Ranking } from "@/lib/types";

const MIN = 20_000_000;
const TICKS = [30_000_000, 100_000_000, 300_000_000, 1_000_000_000, 3_000_000_000, 10_000_000_000, 30_000_000_000, 100_000_000_000];
const LANES = 9;

/** Every CEO is one dot on a logarithmic compensation axis; nearby awards are packed into vertical lanes. */
export default function DotDistribution({ ranking: r }: { ranking: Ranking }) {
  const entries = ranked(r).filter((entry) => entry.value >= MIN);
  if (entries.length < 5) return null;
  const max = Math.max(...entries.map((entry) => entry.value));
  const minLog = Math.log10(MIN);
  const maxLog = Math.log10(max);
  const x = (value: number) => ((Math.log10(value) - minLog) / (maxLog - minLog)) * 100;
  const laneEnds = Array<number>(LANES).fill(-Infinity);
  const placed = [...entries].sort((a, b) => a.value - b.value).map((entry) => {
    const px = x(entry.value);
    const lane = laneEnds.findIndex((end) => (px - end) * 9 >= 10);
    const row = lane < 0 ? laneEnds.indexOf(Math.min(...laneEnds)) : lane;
    laneEnds[row] = px;
    return { ...entry, px, row };
  });
  const ticks = TICKS.filter((value) => value > MIN && value < max);

  return (
    <figure className="viz">
      <div className="dot-dist" role="img" aria-label={`${entries.length} CEO compensation awards shown as dots on a logarithmic dollar scale`}>
        <div className="dot-dist-plot">
          {ticks.map((value) => <i key={value} className="dot-dist-tick" style={{ left: `${x(value)}%` }} />)}
          {placed.map((entry) => (
            <i
              key={entry.name}
              className="dot-dist-point"
              style={{ left: `${entry.px}%`, top: `${entry.row * 11 + 5}px` }}
              data-tip={`#${entry.rank} ${entry.name} · ${entry.detail}: ${formatValue(r, entry.value)}`}
            />
          ))}
        </div>
        <div className="dot-dist-axis">
          {ticks.map((value) => <span key={value} style={{ left: `${x(value)}%` }}>{value >= 1_000_000_000 ? `$${value / 1_000_000_000}B` : `$${value / 1_000_000}M`}</span>)}
        </div>
      </div>
      <figcaption className="viz-cap">
        Each dot is one CEO; hover for the name, company and exact award. The horizontal position uses a logarithmic scale so lower awards remain visible beside unusually large ones.
      </figcaption>
    </figure>
  );
}

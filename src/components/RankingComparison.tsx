"use client";

import { useState } from "react";
import { formatValue } from "@/lib/format";
import type { Ranking } from "@/lib/types";

type Entry = { name: string; value: number; position: number };
type Props = {
  entries: Entry[];
  format: Pick<Ranking, "prefix" | "suffix" | "decimals" | "unit">;
  period: string;
};

/** Two observations from one snapshot: no mixed years, guessed values or synthetic scores. */
export default function RankingComparison({ entries, format, period }: Props) {
  const [first, setFirst] = useState(entries[0].name);
  const [second, setSecond] = useState(entries[1].name);
  const a = entries.find((entry) => entry.name === first)!;
  const b = entries.find((entry) => entry.name === second)!;
  const options = [...entries].sort((x, y) => x.name.localeCompare(y.name));
  const difference = Math.abs(a.value - b.value);
  const percentUnit = format.suffix.includes("%") || format.unit.includes("%");
  const differenceFormat = percentUnit ? { ...format, prefix: "", suffix: " percentage points" } : format;
  return <section className="snapshot-comparison" aria-labelledby="comparison-title">
    <h2 id="comparison-title">Compare two entries</h2>
    <p>Same measure, same snapshot: {period}. Select two entries to see their values and the absolute gap.</p>
    <div className="comparison-controls">
      <label>First entry<select value={first} onChange={(event) => setFirst(event.target.value)}>{options.map((entry) => <option key={entry.name}>{entry.name}</option>)}</select></label>
      <label>Second entry<select value={second} onChange={(event) => setSecond(event.target.value)}>{options.map((entry) => <option key={entry.name}>{entry.name}</option>)}</select></label>
    </div>
    <div className="comparison-results" aria-live="polite" aria-atomic="true">
      <p><strong>{a.name}</strong><span>{formatValue(format, a.value)}</span><small>Position {a.position} of {entries.length}</small></p>
      <p><strong>{b.name}</strong><span>{formatValue(format, b.value)}</span><small>Position {b.position} of {entries.length}</small></p>
      <p><strong>Absolute difference</strong><span>{formatValue(differenceFormat, difference)}</span><small>{a.value === b.value ? "Equal stored values" : `${a.value > b.value ? a.name : b.name} has the higher value`}</small></p>
    </div>
    <p className="comparison-note">Calculated by AllRanks from the displayed values before rounding. Positions follow the table order; equal values are ordered by name. A gap does not establish a cause or an overall quality difference.</p>
  </section>;
}

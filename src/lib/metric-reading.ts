import type { Ranking } from "./types";

/** Additional reading decisions selected from the exact indicator's labels, not causal guesses. */
export function metricReadingNotes(r: Ranking): string[] {
  const label = `${r.title} ${r.unit}`;
  const notes: string[] = [];
  if (/male|female|women|men\b/i.test(label)) notes.push("This label specifies a sex or gender group. Keep that group in the interpretation: its value should not be relabeled as the result for the whole population or compared with a differently defined group without explanation.");
  if (/ages?\b|age \d|aged\b|youth|children/i.test(label)) notes.push("Age coverage is part of this measure. A result for the stated age band is not interchangeable with an all-ages total. Check the population denominator before comparing it with a similarly named indicator.");
  if (/current (?:US\$|USD|prices)|nominal/i.test(label)) notes.push("The label specifies a current-price or nominal basis. A change over time should not automatically be described as a change in real volume; price changes and any currency-conversion basis need separate consideration.");
  if (/constant|real chained/i.test(label)) notes.push("This series identifies a constant-price or chained-price basis. Preserve the stated base year and currency when comparing it with another series; a current-price amount answers a different question.");
  if (/\bPPP\b|purchasing power/i.test(label)) notes.push("Purchasing-power conversion is part of this label. Do not silently substitute a market-exchange-rate dollar series: the conversion basis is part of what makes the two comparisons different.");
  if (/modeled|modelled|estimate|estimated/i.test(label)) notes.push("The title identifies an estimate or modeled measure. Treat it under the publisher’s estimation method rather than describing it as a direct count of every event. Revisions can affect the values even when the underlying reference year stays the same.");
  if (/per 100,?000|per thousand|per 1,?000/i.test(label)) notes.push("The stated population multiplier matters: a rate per one hundred thousand and a rate per thousand are not directly comparable without conversion. Keep the printed unit with any quoted figure.");
  if (/mortality|deaths|homicide|suicide|disease|cancer|prevalence/i.test(label)) notes.push("This is a population-level health or mortality measure, not an assessment of an individual’s medical risk. Age adjustment, diagnostic definitions and reporting coverage must be matched before interpreting differences.");
  if (/emissions|CO2|carbon dioxide|methane/i.test(label)) notes.push("Keep the accounting boundary in view: a territorial total, a consumption-based estimate and a per-person value answer different questions. The title and source definition determine which comparison this table supports.");
  if (/supply|food balance/i.test(label)) notes.push("Supply should not automatically be described as the amount actually consumed by each person. Preserve the source’s supply or availability definition and any food-balance adjustments before interpreting the result as dietary behavior.");
  if (/net employment|job change/i.test(label)) notes.push("A net change is the difference between gains and losses over the stated period. It is not the number of all hires or the stock of all employed people, and it does not alone identify the cause of the change.");
  if (/litres of pure alcohol/i.test(label)) notes.push("This unit describes pure alcohol, not the volume of the beverage. Do not relabel the same number as litres of beer without knowing and applying an alcohol-content assumption.");
  if (/capacity/i.test(label)) notes.push("Capacity describes potential or installed capability under a definition; it is not necessarily actual output or utilization. Compare production separately before inferring how intensively the capacity was used.");
  if (/proven.*reserves|proved.*reserves/i.test(label)) notes.push("Reported reserves are different from current production or annual consumption. The source’s definition and reference point matter before interpreting this stock as an annual flow.");
  if (/CPIA|B-READY|governance|enforcement perceptions/i.test(label)) notes.push("This is an institutional or policy assessment. Use the named pillar or component and its scale; do not turn a single component into an overall judgment of the country or of every person’s experience.");
  return notes;
}

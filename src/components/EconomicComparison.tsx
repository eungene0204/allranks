import Link from "next/link";
import { getRanking } from "@/lib/data";
import { formatValue, ranked } from "@/lib/format";

/** Show why the denominator matters using actual, matching-year stored observations. */
export default function EconomicComparison() {
  const total = getRanking("gdp-nominal");
  const person = getRanking("gdp-per-capita");
  if (!total || !person || total.year !== person.year) return null;
  const perPerson = new Map(ranked(person).map((entry) => [entry.country, entry]));
  const examples = ranked(total).filter((entry) => perPerson.has(entry.country)).slice(0, 5);
  if (!examples.length) return null;
  return <section className="economic-comparison" aria-labelledby="economic-example-title">
    <h2 id="economic-example-title">Same countries, different denominator</h2>
    <p>These are the five largest economies with observations in both stored {total.year} tables. Read across a row: economic size and output per person produce different positions.</p>
    <div className="editorial-table-scroll"><table className="plain">
      <caption>{total.year} snapshot comparison calculated by AllRanks</caption>
      <thead><tr><th scope="col">Country</th><th scope="col">Total GDP</th><th scope="col">Total position</th><th scope="col">GDP per person</th><th scope="col">Per-person position</th></tr></thead>
      <tbody>{examples.map((entry) => {
        const other = perPerson.get(entry.country)!;
        return <tr key={entry.country}><th scope="row">{entry.name}</th><td>{formatValue(total, entry.value)}</td><td>{entry.rank} of {total.items.length}</td><td>{formatValue(person, other.value)}</td><td>{other.rank} of {person.items.length}</td></tr>;
      })}</tbody>
    </table></div>
    <p className="comparison-note">Positions are within each table’s included entries, with equal values ordered by name. This comparison does not estimate household income or explain the causes of a difference.</p>
    <p className="source">Underlying observations: <a href={total.source.url}>World Bank total GDP</a> and <a href={person.source.url}>GDP per capita</a>. <Link href="/ranking/gdp-nominal">Open total GDP</Link> · <Link href="/ranking/gdp-per-capita">Open GDP per capita</Link>.</p>
  </section>;
}

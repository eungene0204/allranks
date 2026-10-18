import Link from "next/link";
import { getCategory } from "@/lib/categories";
import type { CountryDiscovery } from "@/lib/discoveries";
import DiscoveryShare from "./DiscoveryShare";
import CopyRankingLink from "./CopyRankingLink";

export default function CountryDiscoveries({ code, name, discoveries }: { code: string; name: string; discoveries: CountryDiscovery[] }) {
  return <section id="discoveries" className="country-discoveries" aria-labelledby="discoveries-title">
    <p className="discovery-eyebrow">Beyond the headlines</p>
    <h2 id="discoveries-title">Discover {name}’s standout strengths</h2>
    <p className="muted">Explore leading positions across different fields, beyond population and GDP.</p>
    {discoveries.length ? <>
      <div className="discovery-grid">
        {discoveries.map((d) => <article className="discovery-card" key={d.id}>
          <CopyRankingLink id={d.id} title={d.title} />
          <span className="tag">{d.icon} {getCategory(d.category)?.name ?? d.category}</span>
          <p className="discovery-position"><strong>#{d.rank}</strong><span>{d.tied ? "Tied · " : ""}of {d.total} listed countries &amp; territories</span></p>
          <h3><Link href={`/ranking/${d.id}`}>{d.title}</Link></h3>
          <p className="discovery-value">{d.value} <span className="muted">· {d.unit}</span></p>
          <p className="discovery-detail">Top {d.topPercent}% of this list · Reference period: {d.period}</p>
          <p className="discovery-detail"><a href={d.sourceUrl} target="_blank" rel="noopener noreferrer">{d.sourceName} ↗</a></p>
          <p className="discovery-detail">{d.verification}</p>
          <Link className="more" href={`/ranking/${d.id}`}>See ranking &amp; definition →</Link>
        </article>)}
      </div>
      <DiscoveryShare code={code} name={name} />
    </> : <p className="discovery-empty">No qualifying highlights yet. This does not mean {name} lacks strengths — our current data may not cover them. Explore the full rankings below.</p>}
    <details className="discovery-method"><summary>How these highlights are selected</summary>
      <p>We select up to three fields from an editorial pool of indicators with a clear interpretation, with one highlight per category. A country must rank in the top 20% of at least 30 listed countries and territories. We prioritize its strongest relative placement, then newer data. Ties share a rank here; percentages include all countries tied at that position and are rounded up.</p>
      <p>Only country-level datasets from the last five years are eligible. Unverified manual and AI-collected datasets, duplicate country entries, and lists with identical values are excluded. Automatically collected data is not presented as human-checked. Coverage and reference years differ; these highlights are not an overall country score or a claim about causation. <Link href="/methodology">Read our methodology →</Link></p>
    </details>
  </section>;
}

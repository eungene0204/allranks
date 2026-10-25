import Link from "next/link";
import { allRankings } from "@/lib/data";
import { articleContext } from "@/lib/editorial-data";
import { buildRankingArticle } from "@/lib/ranking-article";
import { relatedReadings } from "@/lib/related-readings";
import { guideForRanking } from "@/lib/reading-guides";
import { collectionNote, usesSnapshotYear } from "@/lib/ranking-content";
import type { Ranking } from "@/lib/types";

export function RankingCoverage({ ranking: r }: { ranking: Ranking }) {
  return <aside className="ranking-coverage" aria-labelledby="coverage-title">
    <h2 id="coverage-title">What this comparison includes</h2>
    <p><strong>{r.items.length} listed entries · {r.asOf ?? r.year} {usesSnapshotYear(r) ? "snapshot year" : "reference period"}.</strong> {collectionNote(r)}</p>
    <a href="#ranking-context-title">Definition, source &amp; collection notes ↓</a>
  </aside>;
}

export default function RankingReading({ ranking: r }: { ranking: Ranking }) {
  const article = buildRankingArticle(r, articleContext());
  const guide = guideForRanking(r);
  const related = relatedReadings(r, allRankings());
  return <article className="ranking-reading ranking-article" aria-labelledby="reading-title">
    <header>
      <h2 id="reading-title">{article.title}</h2>
      <p className="guide-answer">{article.lead}</p>
      <p className="editorial-byline">AI-assisted explanation by AllRanks · Calculations use this page’s stored snapshot. <Link href="/editorial-policy">Preparation, source checking &amp; corrections</Link></p>
    </header>
    <nav className="article-outline" aria-label="In this explanation">{article.sections.map((section, index) => <a key={section.title} href={`#reading-section-${index}`}>{section.title}</a>)}</nav>
    {article.sections.map((section, index) => <section key={section.title} id={`reading-section-${index}`}>
      <h3>{section.title}</h3>{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
    </section>)}
    {article.definitionExcerpt && <aside className="publisher-definition">
      <h3>Publisher definition — short excerpt</h3>
      <blockquote>{article.definitionExcerpt.text}</blockquote>
      <p><a href={article.definitionExcerpt.url} target="_blank" rel="noopener noreferrer">Read the full indicator definition ↗</a> · Metadata retrieved {article.definitionExcerpt.retrievedAt.slice(0, 10)}. This is a definition check, not a new audit of every observation.</p>
    </aside>}
    {guide && <p><Link href={`/guides/${guide.id}`}>Related reading: {guide.title} →</Link></p>}
    {related.length > 0 && <section><h3>Continue with a related measure</h3><ul>{related.map((other) => <li key={other.id}><Link href={`/ranking/${other.id}`}>{other.title}</Link><span className="muted"> — {other.asOf ?? other.year}, {other.items.length} entries</span></li>)}</ul><p className="comparison-note">Each page has its own definition and period. These links do not combine positions into an overall score.</p></section>}
    <details className="article-references"><summary>Sources, provenance &amp; corrections</summary>
      <ul>{article.references.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title} ↗</a></li>)}</ul>
      {article.sourceAccess && <p className="comparison-note">Source URL last requested {article.sourceAccess.checkedAt.slice(0, 10)}. {article.sourceAccess.status === 200 ? "The source link responded during this check; that does not establish a review of every value." : "The source could not be retrieved successfully in the last accessibility check. This explanation uses the attributed stored snapshot; it does not claim a fresh source verification."}</p>}
      <p className="comparison-note">Report a disputed value or interpretation with this page’s URL and a supporting source. <Link href="/about#contact">Contact AllRanks →</Link></p>
    </details>
  </article>;
}

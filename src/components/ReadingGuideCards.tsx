import Link from "next/link";
import { READING_GUIDES } from "@/lib/reading-guides";

export default function ReadingGuideCards({ limit }: { limit?: number }) {
  return <section className="reading-guides" aria-labelledby="reading-guides-title">
    <div className="reading-guides-heading">
      <div><h2 id="reading-guides-title">Understand the rankings</h2><p>Start with a question. Choose the right measure before comparing positions.</p></div>
      {limit && <Link href="/guides">All reading guides →</Link>}
    </div>
    <div className="guide-cards">{READING_GUIDES.slice(0, limit).map((guide) => <Link className="guide-card" key={guide.id} href={`/guides/${guide.id}`}>
      <h3>{guide.title}</h3><p>{guide.question}</p><span>Read the explanation →</span>
    </Link>)}</div>
  </section>;
}

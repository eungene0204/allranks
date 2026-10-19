import Link from "next/link";
import { getCategory } from "@/lib/categories";
import { flagEmoji } from "@/lib/format";
import type { RankingCardData } from "@/lib/types";
import Mark from "./Mark";
import RankBadge from "./RankBadge";
import CopyRankingLink from "./CopyRankingLink";
import FreshnessBadge from "./FreshnessBadge";

export default function RankingCard({ ranking: r }: { ranking: RankingCardData }) {
  return (
    <div className="ranking-card-shell">
      <Link className="card" href={`/ranking/${r.id}`} prefetch={false}>
      <span className="tag">
        {r.scope && `${flagEmoji(r.scope)} `}
        {r.icon} {getCategory(r.category)?.name}
      </span>
      <h3>{r.title}</h3>
      <FreshnessBadge year={r.year} editionYear={r.editionYear} />
      <ol>
        {r.top.map((t) => (
          <li key={t.name}>
            <RankBadge rank={t.rank} />
            <span className="entry">
              {t.logo && <Mark icon="" logo={t.logo} />}
              <span className="entry-name" title={t.name}>{!r.scope && !r.entityType && t.flag} {t.name}</span>
            </span>
            <span className="v">{t.formatted}</span>
          </li>
        ))}
      </ol>
      <span className="more">
        {r.entryCount} entries →
      </span>
    </Link>
      <CopyRankingLink id={r.id} title={r.title} />
    </div>
  );
}

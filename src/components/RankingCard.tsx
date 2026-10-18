import Link from "next/link";
import { getCategory } from "@/lib/categories";
import { flagEmoji } from "@/lib/format";
import type { RankingCardData } from "@/lib/types";
import Mark from "./Mark";
import RankBadge from "./RankBadge";

export default function RankingCard({ ranking: r }: { ranking: RankingCardData }) {
  return (
    <Link className="card" href={`/ranking/${r.id}`}>
      <span className="tag">
        {r.scope && `${flagEmoji(r.scope)} `}
        {r.icon} {getCategory(r.category)?.name}
      </span>
      <h3>{r.title}</h3>
      <ol>
        {r.top.map((t) => (
          <li key={t.name}>
            <RankBadge rank={t.rank} />
            <span className="entry">
              {t.logo && <Mark icon="" logo={t.logo} />}
              <span className="entry-name" title={t.name}>{!r.scope && t.flag} {t.name}</span>
            </span>
            <span className="v">{t.formatted}</span>
          </li>
        ))}
      </ol>
      <span className="more">
        {r.entryCount} entries · {r.year} →
      </span>
    </Link>
  );
}

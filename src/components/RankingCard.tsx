import Link from "next/link";
import { getCategory } from "@/lib/categories";
import { formatValue, ranked } from "@/lib/format";
import type { Ranking } from "@/lib/types";
import Mark from "./Mark";
import RankBadge from "./RankBadge";

export default function RankingCard({ ranking: r }: { ranking: Ranking }) {
  const top = ranked(r).slice(0, 3);
  return (
    <Link className="card" href={`/ranking/${r.id}`}>
      <span className="tag">
        {r.icon} {getCategory(r.category)?.name}
      </span>
      <h3>{r.title}</h3>
      <ol>
        {top.map((t) => (
          <li key={t.name}>
            <RankBadge rank={t.rank} />
            <span className="entry">
              {t.logo && <Mark icon="" logo={t.logo} />} {t.flag} {t.name}
            </span>
            <span className="v">{formatValue(r, t.value)}</span>
          </li>
        ))}
      </ol>
      <span className="more">
        {r.items.length} entries · {r.year} →
      </span>
    </Link>
  );
}

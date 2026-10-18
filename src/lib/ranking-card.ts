import "server-only";
import { formatValue, ranked } from "./format";
import type { Ranking, RankingCardData } from "./types";

/** Format previews before crossing the server/client boundary. */
export function toRankingCard(ranking: Ranking): RankingCardData {
  const { id, title, icon, category, year, scope } = ranking;
  return {
    id, title, icon, category, year, scope,
    entryCount: ranking.items.length,
    top: ranked(ranking).slice(0, 3).map(({ name, rank, flag, logo, value }) => ({
      name, rank, flag, logo, formatted: formatValue(ranking, value),
    })),
  };
}

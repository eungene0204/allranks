import "server-only";
import { countryDetail } from "./data";
import { getCategory } from "./categories";

export const COUNTRY_PAGE_SIZE = 48;

export function countryRankingPage(code: string, page: number) {
  const detail = countryDetail(code);
  if (!detail) return undefined;
  return {
    total: detail.world.length,
    rows: detail.world.slice(page * COUNTRY_PAGE_SIZE, (page + 1) * COUNTRY_PAGE_SIZE).map(({ ranking: r, entries, total }) => ({
      id: r.id, title: r.title, icon: r.icon, category: getCategory(r.category)?.name ?? "", year: r.year,
      total, entryCount: entries.length,
      entries: entries.slice(0, 8).map(({ name, rank, logo, formatted }) => ({ name, rank, logo, formatted })),
    })),
  };
}

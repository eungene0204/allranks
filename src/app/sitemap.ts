import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { allRankings, countryCodes } from "@/lib/data";
import snapshots from "../../data/seo-snapshots.json";
import { READING_GUIDES } from "@/lib/reading-guides";
import { columnPath, publishedColumns } from "@/lib/columns";
import { canonicalUrl } from "@/lib/seo";

// All inputs are deployment snapshots. Generate once instead of running a
// function and transferring the full XML on every crawler request.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...["/", "/popular", "/latest", "/about", "/methodology", "/privacy", "/editorial-policy", "/guides", "/columns"].map((path) => ({ url: canonicalUrl(path) })),
    ...publishedColumns().map((column) => ({ url: canonicalUrl(columnPath(column.id)), lastModified: column.publishedOn })),
    ...READING_GUIDES.map((guide) => ({ url: canonicalUrl(`/guides/${guide.id}`) })),
    ...CATEGORIES.map((c) => ({ url: canonicalUrl(`/category/${c.id}`) })),
    ...allRankings().map((r) => ({ url: canonicalUrl(`/ranking/${r.id}`), lastModified: (snapshots as Record<string, { lastModified: string }>)[r.id]?.lastModified })),
    ...countryCodes().map((code) => ({ url: canonicalUrl(`/country/${code}`) })),
  ];
}

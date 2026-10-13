import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { allRankings, countryCodes } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    { url: base },
    ...CATEGORIES.map((c) => ({ url: `${base}/category/${c.id}` })),
    ...allRankings().map((r) => ({ url: `${base}/ranking/${r.id}` })),
    ...countryCodes().map((code) => ({ url: `${base}/country/${code}` })),
  ];
}

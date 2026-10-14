import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { allRankings, countryCodes } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  return [
    { url: base },
    ...["about", "methodology", "privacy"].map((p) => ({ url: `${base}/${p}` })),
    ...CATEGORIES.map((c) => ({ url: `${base}/category/${c.id}` })),
    ...allRankings().map((r) => ({ url: `${base}/ranking/${r.id}` })),
    ...countryCodes().map((code) => ({ url: `${base}/country/${code}` })),
  ];
}

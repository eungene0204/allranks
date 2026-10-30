import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { allRankings, countryCodes } from "@/lib/data";
import snapshots from "../../data/seo-snapshots.json";
import { READING_GUIDES, GUIDE_REVIEWED_AT } from "@/lib/reading-guides";
import { SITE_URL } from "@/lib/site";

// All inputs are deployment snapshots. Generate once instead of running a
// function and transferring the full XML on every crawler request.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  return [
    { url: base },
    { url: `${base}/popular` },
    { url: `${base}/latest` },
    ...["about", "methodology", "privacy", "editorial-policy", "guides"].map((p) => ({ url: `${base}/${p}` })),
    ...READING_GUIDES.map((guide) => ({ url: `${base}/guides/${guide.id}`, lastModified: GUIDE_REVIEWED_AT })),
    ...CATEGORIES.map((c) => ({ url: `${base}/category/${c.id}` })),
    ...allRankings().map((r) => ({ url: `${base}/ranking/${r.id}`, lastModified: (snapshots as Record<string, { lastModified: string }>)[r.id]?.lastModified })),
    ...countryCodes().map((code) => ({ url: `${base}/country/${code}` })),
  ];
}

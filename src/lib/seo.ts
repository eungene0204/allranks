import type { Metadata } from "next";
import { SITE_URL } from "./site";

export function pageMetadata(title: string, description: string, path: string, image = "/share-image"): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title, description, alternates: { canonical: url, types: { "application/rss+xml": `${SITE_URL}/feed.xml` } },
    openGraph: { type: "website", siteName: "AllRanks", title: `${title} – AllRanks`, description, url,
      images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title: `${title} – AllRanks`, description, images: [image] },
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1,
      name: item.name, item: `${SITE_URL}${item.path}` })) };
}

/** Normalize pagination consistently for rendering and canonical URLs. */
export function pageNumber(raw: string | undefined, totalPages: number): number {
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(Math.max(1, Math.floor(value)), Math.max(1, totalPages)) : 1;
}

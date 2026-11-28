import type { Metadata } from "next";
import { SITE_URL } from "./site";

export const SITE_LANGUAGE = "en";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function canonicalUrl(path: string) {
  return `${SITE_URL}${path}`;
}

export function pageMetadata(title: string, description: string, path: string, image = "/share-image"): Metadata {
  const socialTitle = title.endsWith(" – AllRanks") ? title : `${title} – AllRanks`;
  const url = canonicalUrl(path);
  return {
    title, description, alternates: { canonical: url, types: { "application/rss+xml": `${SITE_URL}/feed.xml` } },
    robots: { index: true, follow: true },
    openGraph: { type: "website", siteName: "AllRanks", title: socialTitle, description, url, locale: "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: image === "/share-image" ? "AllRanks" : title }] },
    twitter: { card: "summary_large_image", title: socialTitle, description, images: [image] },
  };
}

export function pageSchema(path: string, name: string, type = "WebPage") {
  const url = canonicalUrl(path);
  return { "@type": type, "@id": `${url}#webpage`, url, name, inLanguage: SITE_LANGUAGE,
    isPartOf: { "@id": WEBSITE_ID }, publisher: { "@id": ORGANIZATION_ID } };
}

/** Search results may clamp page numbers, but indexable collections require actual pages. */
export function collectionPage(raw: string | string[] | undefined, totalPages: number): number | undefined {
  if (raw === undefined) return 1;
  if (typeof raw !== "string" || !/^[1-9]\d*$/.test(raw)) return undefined;
  const value = Number(raw);
  if (Number.isSafeInteger(value) && value <= Math.max(1, totalPages)) return value;
}

export function collectionPath(path: string, page: number) {
  return page > 1 ? `${path}?page=${page}` : path;
}

/** Preserve unrelated parameters when consolidating a known URL alias. */
export function collectionRedirect(path: string, page: number, query: Record<string, string | string[] | undefined>) {
  const url = new URL(collectionPath(path, page), SITE_URL);
  for (const [key, value] of Object.entries(query)) {
    if (key === "page" || value === undefined) continue;
    for (const entry of Array.isArray(value) ? value : [value]) url.searchParams.append(key, entry);
  }
  return url.pathname + url.search;
}

/** Normalize pagination consistently for rendering and canonical URLs. */
export function pageNumber(raw: string | undefined, totalPages: number): number {
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(Math.max(1, Math.floor(value)), Math.max(1, totalPages)) : 1;
}

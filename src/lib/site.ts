/** Deployment settings read from the environment, so no account IDs or addresses live in the repository. */

/** Public AdSense ownership identifier, also served in /ads.txt. Advertising scripts are paused; "off" removes the identifier. */
const PUBLISHER = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-8335444243080631";
export const ADSENSE_CLIENT = /^ca-pub-\d+$/.test(PUBLISHER) ? PUBLISHER : undefined;

/** Public contact address shown on the About and Privacy pages. The environment variable overrides the default. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "allworldranks@gmail.com";

/** Canonical site address (sitemap, metadata). The environment variable overrides the default. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://allranks.world").replace(/\/+$/, "");

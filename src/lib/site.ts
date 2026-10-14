/** Deployment settings read from the environment, so no account IDs or addresses live in the repository. */

/** AdSense publisher ID (public by design: it is also served in /ads.txt). The environment variable overrides the default; "off" disables ads. */
const PUBLISHER = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-8335444243080631";
export const ADSENSE_CLIENT = /^ca-pub-\d+$/.test(PUBLISHER) ? PUBLISHER : undefined;

/** Public contact address shown on the About and Privacy pages. The environment variable overrides the default. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "allworldranks@gmail.com";

/** Canonical site address (sitemap, metadata). The environment variable overrides the default. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.allranks.world").replace(/\/+$/, "");

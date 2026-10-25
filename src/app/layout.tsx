import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import { ADSENSE_CLIENT, CONTACT_EMAIL, SITE_URL } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { types: { "application/rss+xml": `${SITE_URL}/feed.xml` } },
  title: { default: "AllRanks – Every ranking in the world", template: "%s – AllRanks" },
  description:
    "AllRanks collects rankings from around the world: universities, GDP, fuel prices, Big Mac prices and more.",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      ...(process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ? { "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION } : {}),
      ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : {}),
    },
  },
  // Lets Google verify site ownership for AdSense without touching the page body.
  ...(ADSENSE_CLIENT ? { other: { "google-adsense-account": ADSENSE_CLIENT } } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  return (
    <html lang="en">
      <body>
        {gaMeasurementId && /^G-[A-Z0-9]+$/.test(gaMeasurementId) ? <GoogleAnalytics measurementId={gaMeasurementId} /> : null}
        <JsonLd data={{ "@context": "https://schema.org", "@graph": [
          { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "AllRanks", url: SITE_URL, email: CONTACT_EMAIL },
          { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "AllRanks", url: SITE_URL, inLanguage: "en", publisher: { "@id": `${SITE_URL}/#organization` } },
        ] }} />
        <Header />
        <main className="wrap">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <strong>AllRanks</strong> — one place for every ranking in the world.{" "}
            <nav className="footer-links" aria-label="About this site">
              <Link href="/guides">Reading guides</Link>
              <Link href="/editorial-policy">Editorial policy</Link>
              <Link href="/about">About</Link>
              <Link href="/methodology">Methodology</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}

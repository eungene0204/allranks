import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import Header from "@/components/Header";
import { allRankings } from "@/lib/data";
import { ADSENSE_CLIENT, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "AllRanks – Every ranking in the world", template: "%s – AllRanks" },
  description:
    "AllRanks collects rankings from around the world: universities, GDP, fuel prices, Big Mac prices and more.",
  // Lets Google verify site ownership for AdSense without touching the page body.
  ...(ADSENSE_CLIENT ? { other: { "google-adsense-account": ADSENSE_CLIENT } } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <Header rankingCategories={Object.fromEntries(allRankings().map((r) => [r.id, r.category]))} />
        <main className="wrap">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <strong>AllRanks</strong> — one place for every ranking in the world.{" "}
            <span className="muted">Prototype v0.3</span>
            <nav className="footer-links" aria-label="About this site">
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

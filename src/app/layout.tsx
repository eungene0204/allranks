import type { Metadata } from "next";
import Header from "@/components/Header";
import { allRankings } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "AllRanks – Every ranking in the world", template: "%s – AllRanks" },
  description:
    "AllRanks collects rankings from around the world: universities, GDP, fuel prices, Big Mac prices and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header rankingCategories={Object.fromEntries(allRankings().map((r) => [r.id, r.category]))} />
        <main className="wrap">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <strong>AllRanks</strong> — one place for every ranking in the world.{" "}
            <span className="muted">Prototype v0.3</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

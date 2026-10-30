import type { NextConfig } from "next";
import "./scripts/ranking-catalog.mts";

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: "/country/:code",
      // Public deployment snapshots; keep ?page=N server-rendered while caching
      // each URL at Vercel. A separate CDN header outranks Next's private header.
      // Never extend this rule to personalized pages or all application routes.
      headers: [{ key: "Vercel-CDN-Cache-Control", value: "public, s-maxage=86400" }],
    }];
  },
};

export default nextConfig;

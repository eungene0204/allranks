"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    gtag?: (...args: [string, ...unknown[]]) => void;
    dataLayer?: unknown[];
  }
}

function PageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !window.gtag) return;
    const location = new URL(window.location.href);
    location.searchParams.delete("q");
    location.hash = "";
    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_location: location.href,
      ...(pathname === "/search" ? { page_title: "Search rankings – AllRanks" } : {}),
    });
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="beforeInteractive">
        {`window.dataLayer = window.dataLayer || []; window.gtag = function(){window.dataLayer.push(arguments);}; window.gtag('js', new Date()); window.gtag('config', '${measurementId}', { send_page_view: false });`}
      </Script>
      <Suspense fallback={null}>
        <PageView />
      </Suspense>
    </>
  );
}

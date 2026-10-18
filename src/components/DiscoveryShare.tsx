"use client";

import { useState } from "react";

export default function DiscoveryShare({ code, name }: { code: string; name: string }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  async function share() {
    setBusy(true);
    setStatus("");
    setManualUrl("");
    const url = new URL(`/country/${code}#discoveries`, window.location.origin).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} — standout strengths | AllRanks`, text: `Discover ${name}’s standout world rankings, with sources and reference years.`, url });
        setStatus("Shared.");
      } else {
        await navigator.clipboard.writeText(url);
        setStatus("Link copied.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setStatus("Could not share automatically. Copy this link:");
        setManualUrl(url);
      }
    } finally {
      setBusy(false);
    }
  }
  return <div className="discovery-share">
    <button type="button" onClick={share} disabled={busy}>{busy ? "Sharing…" : "Share discoveries"}</button>
    <a href={`/country/${code}/discoveries/share?download=1`} download={`${code.toLowerCase()}-allranks.png`}>Download share card ↓</a>
    <a href={`/country/${code}#discoveries`}>Permalink</a>
    <span className="muted" role="status">{status}</span>
    {manualUrl && <input aria-label="Discovery link to copy" readOnly value={manualUrl} onFocus={(event) => event.currentTarget.select()} />}
  </div>;
}

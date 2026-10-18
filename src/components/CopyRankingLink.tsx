"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_URL } from "@/lib/site";

/** A sibling of card links, so copying never navigates or nests a button in a link. */
export default function CopyRankingLink({ id, title }: { id: string; title: string }) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const input = useRef<HTMLInputElement>(null);
  const url = `${SITE_URL}/ranking/${encodeURIComponent(id)}`;

  useEffect(() => () => clearTimeout(timeout.current), []);
  useEffect(() => {
    if (state === "manual") { input.current?.focus(); input.current?.select(); }
  }, [state]);

  async function copy() {
    clearTimeout(timeout.current);
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      timeout.current = setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("manual");
    }
  }

  return <div className="ranking-copy">
    <button type="button" className="ranking-copy-button" onClick={copy}
      aria-label={`Copy link to ${title}`} title={state === "copied" ? "Link copied" : "Copy ranking link"}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {state === "copied" ? <path d="m5 12 4 4L19 6" /> : <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>}
      </svg>
    </button>
    <span role="status" className={state === "copied" ? "ranking-copy-feedback" : "ranking-copy-announcement"}>{state === "copied" ? "Link copied!" : state === "manual" ? "Copy this ranking link manually." : ""}</span>
    {state === "manual" && <div className="ranking-copy-fallback">
      <label>Copy this ranking link<input ref={input} aria-label={`Link to ${title}`} readOnly value={url} onFocus={(event) => event.currentTarget.select()} /></label>
      <button type="button" onClick={() => setState("idle")}>Close</button>
    </div>}
  </div>;
}

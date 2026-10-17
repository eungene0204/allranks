"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Suggestion = { href: string; title: string; detail: string };
type SearchResponse = { query: string; suggestions: Suggestion[]; error?: boolean };

export default function SearchForm({ query = "", id = "explore-search" }: { query?: string; id?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(query);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const cache = useRef(new Map<string, Suggestion[]>());
  const form = useRef<HTMLFormElement>(null);
  const q = value.trim();
  const current = result?.query === q ? result : null;
  const showSuggestions = open && q.length >= 2;

  useEffect(() => setValue(query), [query]);

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!form.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  // Warm the destination while typing so Enter can use a ready route payload.
  useEffect(() => {
    if (!q) return;
    const timer = window.setTimeout(() => router.prefetch(`/search?q=${encodeURIComponent(q)}`), 200);
    return () => window.clearTimeout(timer);
  }, [q, router]);

  useEffect(() => {
    if (q.length < 2) return;
    const cached = cache.current.get(q);
    if (cached) { setResult({ query: q, suggestions: cached }); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json() as { suggestions: Suggestion[] };
        if (controller.signal.aborted) return;
        cache.current.set(q, data.suggestions);
        setResult({ query: q, suggestions: data.suggestions });
      } catch {
        if (!controller.signal.aborted) setResult({ query: q, suggestions: [], error: true });
      }
    }, 70);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [q]);

  return (
    <form ref={form} action="/search" className="explore-search" role="search"
      onSubmit={(event) => {
        event.preventDefault();
        setOpen(false);
        router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
      }}
      onBlur={(event) => {
        // Mouse/touch focus changes may have a null relatedTarget. Closing then
        // removes the selected link before its click event can navigate.
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}>
      <label htmlFor={id}>Search countries, rankings &amp; entries</label>
      <div className="explore-search-row">
        <input id={id} name="q" type="search" value={value}
          onChange={(event) => { setValue(event.currentTarget.value); setOpen(true); }}
          onFocus={() => { setOpen(true); router.prefetch("/search"); }}
          onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
          placeholder="Try Korea, GDP or MIT…" autoComplete="off"
          aria-expanded={showSuggestions} aria-controls={showSuggestions ? `${id}-suggestions` : undefined} />
        <button type="submit">Search</button>
      </div>
      {showSuggestions && <div className="search-suggestions" id={`${id}-suggestions`}>
        {!current && <p role="status">Searching…</p>}
        {current?.error && <p role="status">Unable to load suggestions. Press Search to see results.</p>}
        {current && !current.error && current.suggestions.length === 0 && <p role="status">No matches. Try another name.</p>}
        {current && current.suggestions.length > 0 && <ul aria-label="Search suggestions">
          {current.suggestions.map((item) => <li key={item.href}><Link href={item.href}>
            <span>{item.title}</span><small>{item.detail}</small>
          </Link></li>)}
        </ul>}
        <Link className="search-all" prefetch={false} href={`/search?q=${encodeURIComponent(q)}`}>View all results for “{q}” →</Link>
      </div>}
    </form>
  );
}

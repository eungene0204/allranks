"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function SearchForm({ query = "", id = "explore-search" }: { query?: string; id?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(query);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const q = value.trim();
    if (!q) {
      if (id === "results-search") {
        const timeout = window.setTimeout(() => router.replace("/search", { scroll: false }), 180);
        return () => window.clearTimeout(timeout);
      }
      return;
    }
    const timeout = window.setTimeout(() => {
      startTransition(() => router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false }));
    }, 180);
    return () => window.clearTimeout(timeout);
  }, [value, router, id, query]);

  return (
    <form action="/search" className="explore-search" role="search">
      <label htmlFor={id}>Search countries, rankings &amp; entries</label>
      <div className="explore-search-row">
        <input
          id={id}
          name="q"
          type="search"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          placeholder="Try Korea, GDP or MIT…"
          autoComplete="off"
        />
        <button type="submit">Search</button>
      </div>
    </form>
  );
}

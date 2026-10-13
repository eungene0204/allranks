"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

function activeCategory(pathname: string, rankingCategories: Record<string, string>): string | undefined {
  const [, kind, id] = pathname.split("/");
  if (kind === "category") return id;
  if (kind === "ranking") return rankingCategories[id];
}

export default function Header({ rankingCategories }: { rankingCategories: Record<string, string> }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const active = activeCategory(pathname, rankingCategories);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/");
  }

  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link className="logo" href="/" aria-label="AllRanks home">
          All<span>Ranks</span>
        </Link>
        <nav className="nav" aria-label="Categories">
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/category/${c.id}`} className={active === c.id ? "active" : undefined}>
              {c.icon} {c.name}
            </Link>
          ))}
        </nav>
        <form className="search" role="search" onSubmit={onSubmit}>
          <input
            type="search"
            placeholder="Search rankings…"
            autoComplete="off"
            aria-label="Search rankings"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
}

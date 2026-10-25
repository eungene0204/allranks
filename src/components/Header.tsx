"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import SearchForm from "@/components/SearchForm";
import catalog from "@/generated/ranking-categories.json";

const rankingCategories: Record<string, string> = catalog;

function activeCategory(pathname: string, rankingCategories: Record<string, string>): string | undefined {
  const [, kind, id] = pathname.split("/");
  if (kind === "category") return id;
  if (kind === "ranking") return rankingCategories[id];
}

export default function Header() {
  const pathname = usePathname();
  const active = activeCategory(pathname, rankingCategories);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!searchWrap.current?.contains(event.target as Node)) setSearchOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [searchOpen]);

  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link className="logo" href="/" aria-label="AllRanks home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-r-c-512.png" alt="" width={36} height={36} />
          All<span>Ranks</span>
        </Link>
        <nav className="nav" aria-label="Categories">
          <Link href="/guides" className={pathname.startsWith("/guides") ? "active" : undefined}>Reading guides</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/category/${c.id}`} className={active === c.id ? "active" : undefined}>
              {c.icon} {c.name}
            </Link>
          ))}
        </nav>
        <div className="header-search-wrap" ref={searchWrap}>
          <button className="header-search-toggle" type="button" aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen} aria-controls="header-search-panel" onClick={() => setSearchOpen((open) => !open)}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
          </button>
          {searchOpen && <div className="header-search-panel" id="header-search-panel">
            <SearchForm compact id="header-search" />
          </div>}
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

function activeCategory(pathname: string, rankingCategories: Record<string, string>): string | undefined {
  const [, kind, id] = pathname.split("/");
  if (kind === "category") return id;
  if (kind === "ranking") return rankingCategories[id];
}

export default function Header({ rankingCategories }: { rankingCategories: Record<string, string> }) {
  const pathname = usePathname();
  const active = activeCategory(pathname, rankingCategories);

  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link className="logo" href="/" aria-label="AllRanks home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-r-c-512.png" alt="" width={36} height={36} />
          All<span>Ranks</span>
        </Link>
        <nav className="nav" aria-label="Categories">
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/category/${c.id}`} className={active === c.id ? "active" : undefined}>
              {c.icon} {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import RankingCard from "@/components/RankingCard";
import type { RankingCardData } from "@/lib/types";

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function RandomRankingCards({
  rankings,
  shuffle = true,
  limit,
  rerollOnRestore = false,
  className,
}: {
  rankings: RankingCardData[];
  shuffle?: boolean;
  limit?: number;
  rerollOnRestore?: boolean;
  className?: string;
}) {
  const [ordered, setOrdered] = useState(rankings);

  useEffect(() => {
    if (!shuffle) return;
    const reroll = () => setOrdered(shuffled(rankings));
    reroll();
    if (!rerollOnRestore) return;
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) reroll();
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [rankings, shuffle, rerollOnRestore]);

  return (
    <div className={`cards${className ? ` ${className}` : ""}`}>
      {(limit === undefined ? ordered : ordered.slice(0, limit)).map((ranking) => <RankingCard key={ranking.id} ranking={ranking} />)}
    </div>
  );
}

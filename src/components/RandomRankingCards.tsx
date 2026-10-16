"use client";

import { useEffect, useState } from "react";
import RankingCard from "@/components/RankingCard";
import type { Ranking } from "@/lib/types";

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function RandomRankingCards({ rankings, shuffle = true, limit }: { rankings: Ranking[]; shuffle?: boolean; limit?: number }) {
  const [ordered, setOrdered] = useState(rankings);

  useEffect(() => {
    if (shuffle) setOrdered(shuffled(rankings));
  }, [rankings, shuffle]);

  return (
    <div className="cards">
      {(limit === undefined ? ordered : ordered.slice(0, limit)).map((ranking) => <RankingCard key={ranking.id} ranking={ranking} />)}
    </div>
  );
}

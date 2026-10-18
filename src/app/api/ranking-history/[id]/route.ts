import { NextRequest, NextResponse } from "next/server";
import { getRanking } from "@/lib/data";
import { getRankingHistory } from "@/lib/ranking-history";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ranking = getRanking((await params).id);
  const country = request.nextUrl.searchParams.get("country") ?? "";
  if (!ranking || !/^[A-Z]{2}$/.test(country) || !ranking.items.some((item) => item.country === country))
    return NextResponse.json({ error: "Ranking or country not found" }, { status: 404 });
  try {
    const history = await getRankingHistory(ranking, country);
    if (!history) return NextResponse.json({ error: "Comparable annual data is unavailable" }, { status: 404 });
    return NextResponse.json(history, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
  } catch (error) {
    console.error(`Ranking history failed for ${ranking.id}:`, error);
    return NextResponse.json({ error: "The source is temporarily unavailable" }, { status: 503 });
  }
}

import { countryInfo, getRanking } from "@/lib/data";
import { countryRankingPage, COUNTRY_PAGE_SIZE } from "@/lib/country-ranking-page";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!countryInfo(code)) return Response.json({ error: "Country not found" }, { status: 404 });
  const search = new URL(request.url).searchParams;
  const id = search.get("ranking");
  const headers = { "Cache-Control": "public, max-age=0, s-maxage=86400" };
  if (id !== null) {
    const ranking = getRanking(id);
    if (!ranking || ranking.scope !== code) return Response.json({ error: "Ranking not found" }, { status: 404 });
    return Response.json(ranking, { headers });
  }
  const rawPage = search.get("page") ?? "0";
  if (!/^\d{1,6}$/.test(rawPage)) return Response.json({ error: "Invalid page" }, { status: 400 });
  const page = Number(rawPage);
  const result = countryRankingPage(code, page);
  if (!result || (page > 0 && page * COUNTRY_PAGE_SIZE >= result.total)) return Response.json({ error: "Page not found" }, { status: 404 });
  return Response.json(result, { headers });
}

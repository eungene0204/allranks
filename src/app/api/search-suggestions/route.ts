import { suggestCountries, suggestRankings } from "@/lib/data";

export function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 200);
  if (query.length < 2) return Response.json({ suggestions: [] });
  return Response.json({ suggestions: [...suggestCountries(query), ...suggestRankings(query)] }, {
    headers: { "Cache-Control": "private, max-age=10" },
  });
}

import { ImageResponse } from "next/og";
import { allRankings, countryInfo } from "@/lib/data";
import { countryDiscoveries } from "@/lib/discoveries";
import { SITE_URL } from "@/lib/site";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const info = countryInfo(code);
  if (!info) return new Response("Country not found", { status: 404 });
  const discoveries = countryDiscoveries(allRankings(), code);
  if (!discoveries.length) return new Response("No qualifying discoveries", { status: 404 });
  const short = (text: string, max: number) => text.length > max ? `${text.slice(0, max - 1)}…` : text;
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "38px 48px", background: "#fcfaf6", color: "#202020", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#9a3619" }}><span>ALLRANKS · BEYOND THE HEADLINES</span><span>{code}</span></div>
      <div style={{ display: "flex", fontSize: 38, fontWeight: 700, marginTop: 14, marginBottom: 20 }}>{short(info.name, 40)}: standout strengths</div>
      {discoveries.map((d) => <div key={d.id} style={{ display: "flex", alignItems: "center", borderTop: "1px solid #ded9d1", padding: "14px 0", gap: 22 }}>
        <div style={{ display: "flex", width: 135, flexShrink: 0, flexDirection: "column" }}>
          <span style={{ fontSize: 38, fontWeight: 700, color: "#ba401e" }}>#{d.rank}{d.tied ? "=" : ""}</span>
          <span style={{ fontSize: 15 }}>of {d.total} listed</span>
          <span style={{ fontSize: 12, color: "#555" }}>countries/territories</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <span style={{ fontSize: 24, fontWeight: 700 }}>{short(d.title, 66)}</span>
          <span style={{ fontSize: 17, marginTop: 4 }}>{d.value} ({d.unit}) · {d.period} · Top {d.topPercent}%</span>
          <span style={{ fontSize: 13, color: "#555", marginTop: 4 }}>{short(d.sourceName, 100)}</span>
          <span style={{ fontSize: 13, color: "#555", marginTop: 2 }}>{d.verification}</span>
        </div>
      </div>)}
      <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", fontSize: 14, color: "#555" }}>
        <span>Selected fields only · Different coverage and reference years · Not an overall country score</span>
        <span style={{ marginTop: 6 }}>{SITE_URL.replace(/^https?:\/\//, "")}/country/{code}#discoveries · Definitions &amp; sources online</span>
      </div>
    </div>,
    { width: 1200, height: 630, headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      ...(new URL(request.url).searchParams.get("download") === "1" ? { "Content-Disposition": `attachment; filename="${code.toLowerCase()}-allranks.png"` } : {}),
    } },
  );
}

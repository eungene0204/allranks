import { ImageResponse } from "next/og";

const size = { width: 1200, height: 630 };

export function GET() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#faf6ef", color: "#202020" }}>
    <div style={{ fontSize: 86, fontWeight: 700, color: "#c34623" }}>AllRanks</div>
    <div style={{ fontSize: 46, marginTop: 32 }}>Explore how the world compares.</div>
    <div style={{ fontSize: 28, marginTop: 28 }}>World rankings · Sources · Reference years</div>
  </div>, size);
}

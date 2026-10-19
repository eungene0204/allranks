import { mapShapes } from "@/lib/map";

export const dynamic = "force-static";

/** Shared geometry: page-specific colours, links and tooltips live on SVG use elements. */
export function GET() {
  const paths = mapShapes().map((shape, index) => `<path id="shape-${index}" d="${shape.d}"/>`).join("");
  return new Response(`<svg xmlns="http://www.w3.org/2000/svg"><defs>${paths}</defs></svg>`, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" },
  });
}

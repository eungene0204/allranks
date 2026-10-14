import { ADSENSE_CLIENT } from "@/lib/site";

export const dynamic = "force-static";

// Authorises Google AdSense to sell this site's ad space. Served only once NEXT_PUBLIC_ADSENSE_CLIENT is set.
export function GET() {
  if (!ADSENSE_CLIENT) return new Response("Not found", { status: 404 });
  const body = `google.com, ${ADSENSE_CLIENT.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

import { getText } from "../lib/http.mts";
import type { Ctx, Fetched } from "../lib/types.mts";

const ARCHIVE = "https://www.lloydslist.com/one-hundred-ports-archive";
const EDITION_PATH = "https://www.lloydslist.com/one-hundred-container-ports-";

const decode = (s: string) => s
  .replace(/&amp;/g, "&").replace(/&#0*39;|&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/&nbsp;/g, " ").replace(/&ndash;/g, "–").replace(/&mdash;/g, "—")
  .replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/** Latest public Lloyd's List annual port edition. Its public list exposes order and port/country, not TEU counts. */
export async function lloydsContainerPorts({ countries }: Ctx): Promise<Fetched> {
  const archive = await getText(ARCHIVE);
  const editions = [...archive.matchAll(/one-hundred-container-ports-(20\d{2})/g)].map((m) => Number(m[1]));
  const editionYear = Math.max(...editions.filter((year) => year <= new Date().getFullYear()));
  if (!Number.isFinite(editionYear)) throw new Error("Lloyd's List archive has no current container-port edition");

  const url = `${EDITION_PATH}${editionYear}`;
  const page = await getText(url);
  const referenceYear = Number(page.match(/In (20\d{2}), the world[’']s leading container ports/i)?.[1]);
  if (!referenceYear || referenceYear >= editionYear) throw new Error(`Lloyd's List ${editionYear}: could not verify the throughput reference year`);

  const items = [];
  const blocks = page.split(/(?=<div class="element-item\b)/);
  for (const block of blocks) {
    if (!block.includes("element-item")) continue;
    const rank = Number(block.match(/<p>\s*(\d+)\s*<\/p>/)?.[1]);
    const name = decode(block.match(/<h3[^>]*class="name"[^>]*>(.*?)<\/h3>/is)?.[1] ?? "");
    const countryName = decode(block.match(/<h3[^>]*class="name"[^>]*>.*?<\/h3>\s*<br\s*\/?\s*>\s*<span[^>]*>(.*?)<\/span>/is)?.[1] ?? "");
    if (!Number.isInteger(rank) || rank < 1 || rank > 100 || !name || !countryName) continue;
    const country = countries.byName(countryName);
    items.push({ name, ...(country ? { country: country.code } : {}), detail: countryName, value: rank });
  }

  items.sort((a, b) => a.value - b.value);
  if (items.length < 80 || items[0]?.value !== 1 || items.at(-1)?.value !== 100) {
    throw new Error(`Lloyd's List ${editionYear}: expected a complete top-100 list, parsed ${items.length} rows`);
  }
  const ranks = new Set(items.map((item) => item.value));
  if (ranks.size !== items.length) throw new Error(`Lloyd's List ${editionYear}: duplicate rank positions`);

  return {
    year: referenceYear,
    editionYear,
    source: {
      kind: "manual",
      name: `Lloyd’s List One Hundred Container Ports ${editionYear}`,
      url,
      verified: true,
      note: `Official annual port order for the ${referenceYear} throughput year. Lloyd’s List publishes the ordered top 100 publicly; exact throughput figures are available only to subscribers. Values here are rank positions, where 1 is busiest.`,
    },
    items,
  };
}

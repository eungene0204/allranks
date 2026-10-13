import { getText } from "./http.mts";

/** Wikipedia's API rate-limits bursts, so page fetches are serialised, spaced out and retried. */
let queue: Promise<unknown> = Promise.resolve();
const GAP_MS = 1500;
const pages = new Map<string, Promise<string>>();

async function fetchHtml(page: string): Promise<string> {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(page)}&prop=text&format=json&formatversion=2&redirects=1`;
  for (let attempt = 1; ; attempt++) {
    const body = await getText(url, 1).catch((e: Error) => e.message);
    try {
      const j = JSON.parse(body) as { parse?: { text: string } };
      if (j.parse) return j.parse.text;
      throw new Error(`page "${page}" not found`);
    } catch (e) {
      const limited = /too many requests|429/i.test(body);
      if (!limited || attempt >= 6) throw e instanceof SyntaxError ? new Error(`"${page}": ${body.slice(0, 80)}`) : e;
      await new Promise((r) => setTimeout(r, 15_000 * attempt));
    }
  }
}

/** Rendered HTML of a Wikipedia page (cached, rate-limit friendly). */
export function wikiHtml(page: string): Promise<string> {
  if (!pages.has(page)) {
    const job = queue.then(() => fetchHtml(page)).finally(() => (queue = new Promise((r) => setTimeout(r, GAP_MS))));
    queue = job.catch(() => undefined);
    pages.set(page, job);
  }
  return pages.get(page)!;
}

const clean = (h: string) =>
  h
    .replace(/<sup[\s\S]*?<\/sup>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<br\s*\/?>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;|&#32;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x2011;|&#8209;/g, "-")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export type WikiTable = { caption: string; rows: string[][] };

/** All <table>s of a page as rows of cleaned cell text (colspan/rowspan are not expanded). */
export function wikiTables(html: string): WikiTable[] {
  return (html.match(/<table[\s\S]*?<\/table>/g) ?? []).map((t) => ({
    caption: clean(t.match(/<caption[\s\S]*?<\/caption>/)?.[0] ?? ""),
    rows: (t.match(/<tr[\s\S]*?<\/tr>/g) ?? []).map((r) => (r.match(/<t[hd][\s\S]*?<\/t[hd]>/g) ?? []).map(clean)),
  }));
}

/** First table whose header row (or caption) contains every given fragment, case-insensitively. */
export function findTable(tables: WikiTable[], ...fragments: string[]): WikiTable {
  const t = tables.find((t) => {
    const head = (t.caption + " " + t.rows.slice(0, 3).map((r) => r.join(" ")).join(" ")).toLowerCase();
    return fragments.every((f) => head.includes(f.toLowerCase()));
  });
  if (!t) throw new Error(`table with "${fragments.join('", "')}" not found — the Wikipedia layout probably changed`);
  return t;
}

/** "$1,234.5", "12.3%", "−4" → number (NaN if none). */
export function parseNum(s: string | undefined): number {
  const m = (s ?? "").replace(/[,$%\s]/g, "").replace(/[−–]/g, "-").match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : NaN;
}

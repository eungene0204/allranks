export type { Item, RankingFile, Source, SourceKind } from "../../src/lib/types.ts";
import type { RankingFile, Item, Source } from "../../src/lib/types.ts";

/** What a ranking is, independent of where its numbers come from. */
export type Meta = Omit<RankingFile, "year" | "asOf" | "source" | "updatedAt" | "items">;

export type Fetched = { year: number; asOf?: string; source: Source; items: Item[] };

export type Country = {
  code: string;
  code3: string;
  name: string;
  official: string;
  aliases: string[];
  lat: number;
  lng: number;
  region: string;
  independent: boolean;
};

export type CountryIndex = {
  all: Country[];
  byCode3: Map<string, Country>;
  byCode2: Map<string, Country>;
  /** Resolve a free-form country name ("Türkiye", "Ivory Coast", …) or undefined. */
  byName: (name: string) => Country | undefined;
};

export type Ctx = { countries: CountryIndex };

/** A ranking whose numbers are fetched automatically. */
export type Pipeline = {
  meta: Meta;
  fetch: (ctx: Ctx) => Promise<Fetched>;
  /** Independent providers for the same metric, tried when the primary is unavailable or behind. */
  fallbacks?: Array<(ctx: Ctx) => Promise<Fetched>>;
  /** Fewest rows a fetch must return (default 20 for world rankings, 5 for scoped ones). Lower it for naturally short lists, e.g. gold producers. */
  minItems?: number;
};

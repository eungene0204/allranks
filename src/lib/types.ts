// Types shared by the website and the data pipeline (scripts/ imports this file too).

export type SourceKind = "api" | "csv" | "wikipedia" | "manual" | "agent";

export type Source = {
  kind: SourceKind;
  name: string;
  url?: string;
  license?: string;
  /** Manual and agent-collected data stays `false` until someone has checked it against the source. */
  verified?: boolean;
  /** Further pages the numbers were read from (agent-collected rankings cite every page they used). */
  urls?: string[];
  note?: string;
};

/** One row of a ranking. Country is omitted for global entity lists such as languages. */
/** `detail` is a muted second line next to the name, e.g. the state an institution is in. */
export type Item = { name: string; country?: string; value: number; logo?: string; detail?: string };

/** The canonical on-disk shape of data/rankings/<id>.json — the only thing the website reads. */
export type RankingFile = {
  id: string;
  title: string;
  /** Short label for tabs and chips on a country page, e.g. "Unemployment". */
  short?: string;
  /** Lower numbers list first within a category (default: alphabetical by title). */
  sort?: number;
  category: string;
  /** Emoji shown on the globe for whoever ranks #1 here (unless the entry has its own logo). */
  icon: string;
  desc: string;
  unit: string;
  prefix: string;
  suffix: string;
  decimals: number;
  /** "desc": higher value ranks first. "asc": lower value ranks first. */
  order: "asc" | "desc";
  /**
   * Set (to an ISO-2 code) for a ranking of regions *inside* one country, e.g. US states. Every item then
   * carries that code as `country`; the ranking shows up on the country's page, not in the world totals.
   */
  scope?: string;
  /** True for lists of things that each belong to a country (cities, websites…), so countries may repeat. */
  multi?: boolean;
  /** Global entity ranking that is not a ranking of countries (e.g. languages or ports). */
  entityType?: "language" | "port" | "product" | "bank";
  year: number;
  /** Year this ranking edition was published, when it differs from the data reference year. */
  editionYear?: number;
  /** Finer-grained period than `year`, e.g. "2026-07". */
  asOf?: string;
  source: Source;
  updatedAt: string;
  items: Item[];
};

export type Ranking = RankingFile;

export type RankedEntry = { rank: number; name: string; country: string; flag: string; value: number; logo?: string; detail?: string };

/** Only the values rendered by a ranking preview card. */
export type RankingCardData = Pick<Ranking, "id" | "title" | "icon" | "category" | "year" | "editionYear" | "scope" | "entityType"> & {
  entryCount: number;
  top: { name: string; rank: number; flag: string; formatted: string; logo?: string }[];
};

/** One row per ranking: the country's best position there, who holds it, and how many entries it has in it. */
export type CountryAppearance = {
  id: string;
  title: string;
  icon: string;
  rank: number;
  /** The best-placed entry (e.g. "MIT"). */
  entry: string;
  logo?: string;
  value: string;
  count: number;
};

export type CountrySummary = {
  code: string;
  flag: string;
  name: string;
  lat: number;
  lng: number;
  /** Number of #1 positions. */
  firsts: number;
  /** Number of top-3 positions. */
  top3: number;
  appearances: CountryAppearance[];
  /** Rankings that exist only inside this country (its states, cities, universities…), shown on its detail page. */
  regional: { id: string; title: string; short: string; icon: string }[];
};

// Types shared by the website and the data pipeline (scripts/ imports this file too).

export type SourceKind = "api" | "csv" | "wikipedia" | "manual";

export type Source = {
  kind: SourceKind;
  name: string;
  url?: string;
  license?: string;
  /** Manual data stays `false` until someone has checked it against the source. */
  verified?: boolean;
  note?: string;
};

/** One row of a ranking. `country` is an ISO 3166-1 alpha-2 code; `logo` is a domain whose file lives in public/logos. */
export type Item = { name: string; country: string; value: number; logo?: string };

/** The canonical on-disk shape of data/rankings/<id>.json — the only thing the website reads. */
export type RankingFile = {
  id: string;
  title: string;
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
  year: number;
  /** Finer-grained period than `year`, e.g. "2026-07". */
  asOf?: string;
  source: Source;
  updatedAt: string;
  items: Item[];
};

export type Ranking = RankingFile;

export type RankedEntry = { rank: number; name: string; country: string; flag: string; value: number; logo?: string };

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
};

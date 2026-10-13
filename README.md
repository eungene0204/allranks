# AllRanks

Every ranking in the world, in one place. Next.js (App Router) + React + TypeScript; pages are generated statically from JSON files.

```bash
npm run dev            # http://localhost:3100
npm run build          # validates data first (prebuild), then builds
```

## Data pipeline

```
data/countries.json        reference table: ISO codes, names, coordinates (from mledoze/countries)
data/rankings/<id>.json    one canonical file per ranking — the ONLY thing the website reads
scripts/                   fetchers + validation (plain Node, no extra dependencies)
```

| Command | What it does |
| --- | --- |
| `npm run data:update` | Fetch every automated ranking and rewrite its JSON (only if the data changed) |
| `npm run data:update -- big-mac` | Update just one ranking |
| `npm run data:update -- --dry` | Fetch and report, write nothing |
| `npm run data:validate` | Check every `data/rankings/*.json` (also runs automatically before `npm run build`) |
| `npm run data:countries` | Refresh `data/countries.json` |

### Automated rankings (`scripts/registry.mts`)

| Ranking | Source |
| --- | --- |
| GDP, population, life expectancy | World Bank Open Data API (latest year with ≥150 countries, one year for all rows) |
| Big Mac prices | The Economist's open Big Mac Index (GitHub CSV) |
| Internet speed (fixed, mobile) | Ookla Speedtest Global Index, tabulated on Wikipedia (CC BY-SA) |
| GDP per capita (nominal / PPP), tax revenue, inflation, unemployment, health spending, fertility, urbanisation, ageing, homicide, internet use, R&D, military spending, land area, forest area, renewables, CO₂, Gini | World Bank Open Data (`worldBankRankings()` in `scripts/registry.mts`) |
| Billionaires (Forbes), millionaires (UBS), Nobel laureates, largest cities (UN), most visited websites (Similarweb), oil reserves (EIA), coffee and wine production (FAO) | Wikipedia tables via `scripts/sources/wikipedia-world.mts` (CC BY-SA) |

Safety nets: a failed or suspicious fetch (non-numeric values, duplicate countries, < 20 items, > 30 % fewer items than before)
**keeps the old file** and exits non-zero. `validate` fails the build on malformed data and warns when automated data is > 120 days old.

### Country-specific rankings (US first)

A ranking with `"scope": "US"` exists only inside that country: its items carry `country: "US"` and name a state, city, university,
company, airport… (optional `detail` shows a muted second line, e.g. the state). Clicking a country's flag on the globe opens
`/country/US`, which leads with these rankings (tabs grouped by category) and lists the world rankings below. They never count toward
the world totals or the home page.

The US university rankings (most selective, graduation rate, graduate earnings, average SAT) come from the U.S. Department of Education's
College Scorecard bulk file (public domain; `scripts/sources/college-scorecard.mts` unzips it with node's zlib and keeps only four-year
schools with ≥ 800 undergraduates). U.S. News & World Report's overall ranking is proprietary and is not used.

The other US rankings (endowments, public-university enrollment, state unemployment / income / poverty / GDP / population / density /
area / life expectancy / homicide and gun rates / household gun ownership, largest cities and companies, skyscrapers, airports,
national parks) are defined in `usRankings()` in `scripts/registry.mts` and read from Wikipedia's tables by
`scripts/sources/wikipedia-us.mts` (throttled and cached in `scripts/lib/wikipedia.mts`). To add another country, add rankings with its
`scope` code; its page picks them up automatically.

### Manual rankings

QS universities, gasoline prices, happiness and tallest buildings have no stable free API, so they live directly in
`data/rankings/<id>.json` with `"source": { "kind": "manual", "verified": false }`. The site labels them **Sample data**
until someone checks the values against the source and flips `verified` to `true`.

### Adding a ranking

1. **Automated:** add a source adapter in `scripts/sources/` (returns `{ year, source, items }` with ISO-2 `country` codes — use
   `ctx.countries.byName()` / `byCode3` to map names), then register it with its metadata in `scripts/registry.mts`, and run `npm run data:update -- <id>`.
2. **Manual:** create `data/rankings/<id>.json` following `RankingFile` in `src/lib/types.ts`.

Then `npm run data:validate`. Pages, sitemap, search and the globe pick the new ranking up automatically.
New category? Add it to `src/lib/categories.ts`.

### Logos

An item may carry `"logo": "mit.edu"`; the site then shows `public/logos/mit.edu.png` instead of the ranking's emoji icon.

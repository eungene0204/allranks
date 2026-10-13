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

Safety nets: a failed or suspicious fetch (non-numeric values, duplicate countries, < 20 items, > 30 % fewer items than before)
**keeps the old file** and exits non-zero. `validate` fails the build on malformed data and warns when automated data is > 120 days old.

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

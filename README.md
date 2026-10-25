# AllRanks

Every ranking in the world, in one place. Next.js (App Router) + React + TypeScript; pages are generated statically from JSON files.

```bash
npm run dev            # http://localhost:3100
npm run build          # validates data first (prebuild), then builds
npx --yes vercel@latest deploy --prod --yes  # deploy to allranks.world
```

Use the current Vercel CLI for production deploys. The machine's older global CLI (`59.15.1`) returned `Not authorized`; `64.5.0` deployed successfully with the same account and project.

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
| AI models (Epoch AI), private AI investment (CSET), AI papers, AI job postings, generative-AI use, robot density | Our World in Data CSV (`scripts/sources/owid.mts`, CC BY) |
| AI supercomputers / AI data centers: count, compute, power, largest clusters (Epoch AI) | Epoch AI GPU Clusters CSV (`scripts/sources/epoch.mts`, CC BY) |
| TOP500 systems, semiconductor exports | Wikipedia tables (`scripts/sources/wikipedia-topics.mts`) |
| Stock-market size, remittances, reserves, FDI, private credit, population dynamics, electricity and energy use, mineral rents, CO₂ / methane / PM2.5, protected land | World Bank Open Data (`scripts/topics.mts`) |
| Electricity, oil, gas, coal, copper, iron ore, silver, lithium, diamonds, government debt, median age, vehicles, EV share, largest companies | Wikipedia tables via `scripts/sources/wikipedia-topics.mts` (CC BY-SA; underlying data: Ember, EIA, USGS, IMF, CIA, OICA, Fortune) |
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

Country pages also use shared public datasets where coverage allows: OpenAlex research impact, publication volume, h-index,
i10-index and recent citedness; GeoNames city population and elevation; and OurAirports airport elevation and longest runway.
These lists are saved only when at least five comparable institutions, cities or airports are available, and are capped at 50 rows.
Country-specific reference rankings may use data from 2020 onward; the actual observation year remains visible on the page.

### Data agent (AI)

`scripts/agent/` is a Claude-powered agent that finds rankings the site lacks and refreshes the hand-entered ones. It researches with
web search/fetch and can only publish through two validated tools, so a bad submission is rejected rather than written.

| Command | What it does |
| --- | --- |
| `npm run agent:plan` | Show coverage gaps (empty categories) and what is due for refresh. No API calls |
| `npm run agent -- discover [--category energy] [--max-new 3]` | Research and add new rankings |
| `npm run agent -- refresh [--max-updates 5]` | Run the pipelines, then update stale hand-entered / agent-collected rankings |
| `npm run agent -- run` | Refresh, then discover (manual full run) |
| add `--dry` | Validate everything, write nothing |

Needs `ANTHROPIC_API_KEY` (or `ant auth login`). `AGENT_MODEL` / `AGENT_EFFORT` override `claude-sonnet-5-5` / `high`. Agent-collected rankings carry
`"source": { "kind": "agent", "verified": false }` and show as *AI-collected · unverified*; rejected topics are remembered in `data/agent/notes.json`.
Daily collection, source verification, validation, and Vercel production deployment run locally at midnight through the `allranks-daily-local-deploy` skill and macOS LaunchAgent. GitHub Actions `data-agent.yml` and `container-ports.yml` retain manual dispatch only; they no longer schedule ranking jobs. The local job requires an active logged-in macOS session and a clean production worktree. See `~/Library/Logs/allranks-daily-local-deploy.log` for its run log.

### Other countries

Besides the US, 177 other countries currently have at least one country-specific ranking. The 100 or so with detailed pages cover every OECD, G20, BRICS, EU and ASEAN member (South Korea, Japan, China, India, Germany, the UK, France, Italy, Spain, Canada,
Australia, Brazil, Mexico, Russia, Indonesia, Turkey, the Netherlands, Switzerland, Poland, Sweden, Argentina, South Africa, Thailand,
Malaysia, Saudi Arabia, Egypt, Pakistan, Austria, Belgium, Norway, Finland, Greece, New Zealand, Ukraine, Chile, Colombia, Costa Rica,
Czechia, Denmark, Estonia, Hungary, Ireland, Israel, Iceland, Lithuania, Luxembourg, Latvia, Portugal, Slovenia, Slovakia) and every EU and ASEAN member (Romania, Bulgaria, Croatia, Cyprus, Malta, Singapore, the Philippines, Myanmar, Cambodia, Laos, Brunei, Timor-Leste) plus 20 African Union members (Algeria, Morocco, Kenya, Ghana, Tanzania, Uganda, Tunisia, Angola, Côte d'Ivoire, Cameroon, Senegal, Zambia, Zimbabwe, Mozambique, Sudan, DR Congo and the earlier Egypt, Ethiopia, Nigeria, South Africa): regional population and GDP,
largest cities, tallest buildings, busiest airports and — where Wikipedia has a table — universities and companies. They are declared
in `scripts/regional/<cc>.mts`: `rank()` gives the metadata and `fromTable()` says which Wikipedia table and columns to read. To add a
country, create its module, list it in `scripts/regional/index.mts` and run `npm run data:update -- <cc>-<slug> …`.

Countries without a regional ranking get a **largest-cities** list from [GeoNames](https://www.geonames.org) (CC BY 4.0, places over 15,000 people, `scripts/regional/geonames.mts`), and 16 African countries whose Wikipedia articles have no table get a regional-population list from Wikidata (CC0, `scripts/regional/wikidata.mts`). GeoNames and Wikidata figures come from different years, which each ranking notes.

Every independent country (except the US, which uses College Scorecard, and 40 tiny states with fewer than five universities in the data)
also gets a **research-impact university ranking** from [OpenAlex](https://openalex.org) (CC0): institutions of type "education" ordered by
the total citations their papers have received (`scripts/regional/openalex.mts`, one API call per country). It measures research output,
not teaching quality or prestige, and favours large, old universities; China, the UK and Canada also keep their QS / league-table rankings.

### Site settings (environment variables, read at build time)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used by the sitemap and metadata (default `https://allranks.world`) |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense publisher ID (`ca-pub-…`, default `ca-pub-8335444243080631`). Enables the ad script, the verification meta tag and `/ads.txt`; set it to `off` to turn ads off |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact address shown on the About and Privacy pages (default `allworldranks@gmail.com`) |

### Ranking visualizations

Each ranking page leads with one picture chosen by what the numbers are (`pickViz` in `src/lib/viz.ts`): one of 12 forms — map, treemap, region bar, packed bubbles, waffle, distribution strip, histogram, scatter against a related ranking, diverging bars, bubble map, podium, lollipop.
`npm run viz:report [-- <id>…]` shows the pick; exceptions go in `VIZ_OVERRIDES`, opt-in scatters against a related ranking in `VIZ_PAIRS` (empty by default). The procedure lives in the `ranking-viz` skill (`.claude/skills/ranking-viz`).

### World map

Map-type rankings use a map built from `world-atlas`. `data/map-codes.json` links each map shape to an ISO code; regenerate it with `npm run data:map` if the atlas changes.

### Manual rankings

QS universities, gasoline prices, happiness and tallest buildings have no stable free API, so they live directly in
`data/rankings/<id>.json` with `"source": { "kind": "manual", "verified": false }`. The site labels them **Sample data**
until someone checks the values against the source and flips `verified` to `true`.

The IMF credit rankings (`imf-credit-outstanding`, `imf-credit-gdp`) are manual snapshots from [Visual Capitalist's October 2026 ranking](https://www.visualcapitalist.com/countries-owe-the-most-money-to-imf/), based on IMF credit data. They show the article's 26 largest borrowers (about $1 billion or more), with USD debt and GDP-share values rounded to one decimal; they are not a complete list of every borrower.

### Adding a ranking

1. **Automated:** add a source adapter in `scripts/sources/` (returns `{ year, source, items }` with ISO-2 `country` codes — use
   `ctx.countries.byName()` / `byCode3` to map names), then register it with its metadata in `scripts/registry.mts`, and run `npm run data:update -- <id>`.
2. **Manual:** create `data/rankings/<id>.json` following `RankingFile` in `src/lib/types.ts`.

Then `npm run data:validate` and check the page's visualization with `npm run viz:report -- <id>` (see above). Pages, sitemap, search and the globe pick the new ranking up automatically.
New category? Add it to `src/lib/categories.ts`.

### Logos

An item may carry `"logo": "mit.edu"`; the site then shows `public/logos/mit.edu.png` instead of the ranking's emoji icon.

The AllRanks brand mark is `public/brand/logo-r-c-512.png`; the header and browser app icon use this asset.

## SEO verification

`npm run seo:check -- http://localhost:3200` checks actual HTML responses against the canonical production domain. Run `npm run build` and `npx next start -p 3200` first. It checks canonical URLs, all ranking rows, JSON-LD, crawlable pagination, robots, sitemap and private-ranking 404s. A second argument writes JSON results.

`npm run seo:snapshots` maintains content hashes and observed modification times in `data/seo-snapshots.json`; prebuild runs it automatically. Fetch timestamp changes alone do not update sitemap dates. The initial date means first observed publication in this manifest, not the original source publication date. Keep the manifest in version control.

Optional ownership meta tags use `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION`, and `NEXT_PUBLIC_NAVER_SITE_VERIFICATION`. Set only the values issued by each service. AdSense verification does not substitute for Search Console registration. See `seo_operations.md` for measurement and account-dependent follow-up.

## RSS

Subscribe at `https://allranks.world/feed.xml` (RSS 2.0). The feed includes up to 50 public ranking snapshots, ordered by the content observation dates in `data/seo-snapshots.json`. Ties use ranking IDs for stable ordering. Initial entries share the first observation date; these dates are not original source publication dates. GUIDs combine each ranking URL and its content hash so timestamp-only fetches do not generate new notifications. Source attribution and reference periods appear in item descriptions. The footer and HTML alternate links expose the feed for readers.

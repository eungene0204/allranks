# AllRanks 소프트웨어 아키텍처

> 마지막 업데이트: 2026-10-15 · 버전 0.2.0

## 1. 개요

AllRanks는 **정적 사이트 생성(SSG)** 방식의 Next.js 앱이다. 서버 DB도, 런타임 API도 없다.
모든 데이터는 저장소 안의 JSON 파일이며, 빌드 시점에 읽어 페이지를 생성한다.
데이터 갱신은 별도의 Node 스크립트 파이프라인이 담당한다.

```
외부 소스 (World Bank, Economist, Ookla, Wikipedia …)
        │  scripts/update.mts  (fetch → 검증 → 변경 시에만 쓰기)
        ▼
data/rankings/<id>.json   ← 웹사이트가 읽는 유일한 데이터
data/countries.json       ← ISO 코드·이름·좌표 참조 테이블
        │  src/lib/data.ts  (빌드 시 fs로 읽기)
        ▼
Next.js App Router 페이지 (정적 생성) → 브라우저
```

## 2. 기술 스택

| 영역 | 선택 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router) — **AGENTS.md 참고: 기존 지식과 다른 변경점이 있으므로 코드 작성 전 `node_modules/next/dist/docs/` 확인** |
| UI | React 19, TypeScript 5.9, 순수 CSS (`src/app/globals.css`) |
| 지구본·지도 | `d3-geo`(orthographic 투영), `topojson-client`, `world-atlas`(110m) — Canvas/SVG 직접 렌더링 |
| 원 패킹 | `d3-hierarchy`(`pack`) — 배치 계산만 하고 HTML 로 렌더링 |
| 데이터 스크립트 | Node 네이티브 TypeScript 실행(`.mts`, type-stripping — enum·parameter property 사용 불가), 추가 의존성 없음 |
| 데이터 수집 에이전트 | `@anthropic-ai/sdk`(devDependency), 모델 기본값 `claude-sonnet-5-5`(`AGENT_MODEL`로 변경), 서버 도구 web_search/web_fetch + 커스텀 도구, 수동 에이전트 루프 |
| 린트 | `tsc --noEmit` (`npm run lint`) |
| 포트 | 개발/프로덕션 모두 3100 |

## 3. 디렉터리 구조

```
.github/workflows/data-agent.yml  주간 스케줄: 파이프라인 + 에이전트 실행 → PR 생성
data/
  agent/                    에이전트 상태: notes.json(거절·후보 주제), last-run.json/.md (웹은 읽지 않음)
  countries.json            국가 참조 테이블 (mledoze/countries 기반)
  rankings/<id>.json        랭킹 1개 = 파일 1개 (현재 648개: 세계 91 + US 24 + 기타 165개국 533)
scripts/
  update.mts                랭킹 데이터 갱신 CLI
  validate.mts              data/rankings 검증 (prebuild에서 자동 실행)
  countries.mts             countries.json 갱신
  registry.mts              자동 랭킹 등록부 (메타데이터 + 소스 어댑터 연결)
  topics.mts                AI·Markets·Energy·Money·Demographics·Mining·Autos·Green 랭킹 39개 정의
  regional/geonames.mts      지역 랭킹이 없는 나라의 대도시 순위(GeoNames cities15000 덤프 1회 다운로드·zip 해제, 도시 5개 미만 국가는 `NO_CITIES` 로 제외)
  regional/wikidata.mts      위키피디아 표가 없는 나라의 1차 행정구역 인구(Wikidata SPARQL, 구역별 최신 기준일 값, `WIKIDATA_REGIONS` 목록)
  regional/openalex.mts     모든 독립국의 대학 순위(OpenAlex API, 나라당 1회 호출) — index.mts 가 국가 목록으로 자동 생성, 5개 미만 국가는 `NO_UNIVERSITIES` 로 제외
  regional/                 국가별 랭킹 모듈 (<cc>.mts 1국가 1파일) + index.mts. lib.mts 의 `rank()`·`fromTable()` 로 Wikipedia 표 → 랭킹을 선언적으로 정의
  lib/                      http, wikipedia(캐시·스로틀), countries, csv, types
  agent/                    AI 데이터 수집 에이전트 (§5.1)
    index.mts               CLI: plan | discover | refresh | run
    loop.mts                에이전트 루프 (스트리밍, pause_turn·refusal·토큰/턴 한도 처리, 거부 시 fallback)
    tools.mts               list_rankings, read_ranking, create_ranking, update_ranking, record_finding + 가드
    gaps.mts                결정적 갭 분석 (빈 카테고리, 갱신 대상) — LLM 없음
    prompts.mts             시스템 프롬프트(안정, 캐시 대상) + 모드별 작업 프롬프트
    store.mts               랭킹 파일 접근, data/agent/ 상태(notes.json, last-run.json/.md)
  lib/check.mts             랭킹 1개 구조 검사 (validate.mts와 에이전트가 공유)
  viz-report.mts            랭킹별 시각화 선택 보고 (`npm run viz:report [-- <id>…]`)
  map-codes.mts             지도 도형 이름 → ISO 코드 매핑(data/map-codes.json) 생성 (`npm run data:map`)
  sources/                  소스 어댑터: worldbank, owid(Our World in Data CSV, 연도·분기 `day` 열 지원, `exclude`), epoch(Epoch AI GPU 클러스터 CSV: 국가별 개수·H100 환산 연산력·전력, 대형 클러스터; 'Superseded by' 행은 이중 집계 방지를 위해 제외), bigmac, wikipedia-world, wikipedia-topics(wikiCountries 팩토리), wikipedia-us, wikipedia-speed
src/
  lib/site.ts                        배포 환경변수(ADSENSE_CLIENT, CONTACT_EMAIL, SITE_URL)
  app/
    layout.tsx, globals.css, not-found.tsx, sitemap.ts, robots.ts(전체 허용·`/search` 제외·사이트맵 위치)
    page.tsx                         홈 (지구본 + 랭킹 카드, 카테고리 탐색은 헤더에서 제공)
    ranking/[id]/page.tsx            랭킹 상세
    category/[id]/page.tsx           카테고리별 목록
    country/[code]/page.tsx          국가 상세 (국가 한정 랭킹 + 세계 랭킹 내 순위)
    search/page.tsx                  검색
    about / methodology / privacy    정보 페이지 (methodology는 데이터에서 출처 표 생성)
    ads.txt/route.ts                 AdSense ads.txt (환경변수 설정 시에만 200, 정적)
  components/
    GlobeExplorer.tsx   인터랙티브 지구본 (클라이언트 컴포넌트, 국기 툴팁)
    RankingCard / RankingTable / RankingViz(상단 시각화 디스패처) / RankingMap(`map`) / viz/(Treemap·Regions·Packed·Waffle·Strip·Histogram·Scatter·Diverging·Bubbles·Podium·Lollipop) / RankingInsights(표 아래 자동 해설) / RankBadge / SourceLine / Header / Mark
    CountryRegional.tsx 국가 페이지의 지역(주·도시 등) 랭킹 탭
    SearchForm.tsx      홈·검색 결과 페이지 공유 GET 검색 폼 (/search?q=…)
    Header.tsx          로고·카테고리 탐색 (헤더 검색창 제거)
  lib/
    types.ts            웹과 스크립트가 공유하는 타입 (RankingFile 등)
    categories.ts       카테고리 정의 (7개로 통합: economy, education, tech, ai, society, energy, world)
    data.ts             JSON 로더 + 집계 (server-only)
    format.ts           값 포맷, 순위 계산, 국기 이모지
    map.ts              world-atlas(110m)를 Natural Earth 투영의 SVG 경로로 변환(프로세스당 1회), `data/map-codes.json`으로 도형→ISO 코드 연결
    viz.ts              랭킹 성격(단위·개수·음수·scope·multi)으로 시각화 6종 중 하나를 고르는 `pickViz`, 예외 `VIZ_OVERRIDES`, 산점도 짝 `VIZ_PAIRS`(현재 비어 있음)·축 이름 `AXIS_NAMES`
    treemap.ts / scale.ts  squarified 트리맵 배치 / 선형·로그 눈금과 틱
    insights.ts         랭킹 값으로 해설 문장·meta description 생성 (순수 함수, 외부 지식/LLM 없음)
.claude/skills/ranking-viz/  시각화 선택·검증 절차 프로젝트 스킬 (랭킹 추가·변경 시마다 사용)
public/logos/           항목 로고 (<domain>.png)
```

## 4. 데이터 모델

핵심 타입은 `src/lib/types.ts`의 `RankingFile`이며 스크립트와 웹이 함께 import한다.

- **RankingFile**: `id`(파일명과 동일), `title`, `short?`, `category`, `icon`, `desc`, `unit/prefix/suffix/decimals`,
  `order`(`asc`|`desc`), `scope?`, `multi?`, `year`, `asOf?`, `source`, `updatedAt`, `items[]`
- **Item**: `name`, `country`(ISO-2), `value`, `logo?`, `detail?`
- **Source**: `kind`(`api`|`csv`|`wikipedia`|`manual`|`agent`), `name`, `url?`, `urls?`(추가 참고 페이지), `license?`, `verified?`, `note?`
- **scope**: ISO-2 코드가 있으면 "그 나라 내부 랭킹"(예: US 주). 세계 집계·홈에서 제외되고 `/country/<code>`에만 표시된다.
- **multi**: 한 국가가 여러 번 등장 가능한 목록(도시, 웹사이트 등).

파생 타입(`CountrySummary`, `CountryAppearance`, `RankedEntry`)은 `data.ts`에서 계산되며 디스크에 저장되지 않는다.

## 5. 데이터 파이프라인

1. `registry.mts`가 자동 랭킹의 메타데이터와 소스 어댑터를 선언한다 (`worldBankRankings()`, `usRankings()` 등).
2. `update.mts`가 어댑터를 실행해 `{ year, source, items }`를 받고 JSON을 다시 쓴다. 내용이 바뀐 경우에만 쓴다.
3. **안전장치**: 숫자가 아닌 값, 중복 국가, 항목 20개 미만(`Pipeline.minItems` 로 조정 가능, 예: 리튬 생산국 10), 이전 대비 30% 초과 감소 시 **기존 파일 유지 + 비정상 종료**.
4. `validate.mts`가 스키마·국가 코드·중복·카테고리를 검사한다. 오류면 빌드 실패, 120일 초과 자동 데이터는 경고.
5. 수동 랭킹(QS 대학, 휘발유, 행복지수, 최고층 빌딩)은 JSON을 직접 편집하며 `verified: false`면 사이트에 "Sample data"로 표시.

### 5.1 데이터 수집 에이전트

```
npm run agent -- run          (스케줄: .github/workflows/data-agent.yml → PR)
  1. refresh: scripts/update.mts 실행 (자동 파이프라인, LLM 없음)
  2. refresh: 수동·agent 랭킹 중 갱신 대상(30일 경과, 또는 미검증 manual)을 Claude가 조사 → update_ranking
  3. discover: 커버리지 리포트(빈 카테고리 8개 우선)를 보고 Claude가 새 랭킹 조사 → create_ranking
  4. data:validate 실행, data/agent/last-run.{json,md} 기록
```

- 모델은 파일에 직접 쓰지 않는다. 도구 핸들러(`tools.mts`)가 `checkRanking`(= `data:validate` 규칙) + 자체 가드를 통과한 경우에만 `data/rankings/<id>.json` 을 쓴다. 거부되면 사유를 `is_error` tool_result 로 돌려 모델이 고쳐 재제출한다.
- 가드: id 형식·중복(파이프라인 id 포함), 세계 랭킹 20행 이상, source URL은 http(s), 갱신은 `manual`/`agent` 소스만 허용·더 새로운 데이터만·행 30% 초과 감소 금지·값 3배 초과 변동 시 `confirm_large_changes` 필요. 같은 `manual` 목록의 국가 중복은 `multi` 로 유지.
- 신규/갱신 데이터는 `source.kind: "agent"`, `verified: false`. 사이트가 "AI-collected · unverified" 로 표시하고 `validate` 가 미검증 경고를 낸다.
- 비용 통제: 실행당 신규/갱신 개수, 턴 수(`--max-turns`), 토큰 합계(`--max-tokens`), 요청당 web 도구 사용 횟수 한도. 시스템 프롬프트·도구 목록은 안정적으로 유지하고 `cache_control` 로 프롬프트 캐시를 쓴다.
- `record_finding` 으로 거절/후보 주제를 `data/agent/notes.json` 에 남겨 다음 실행 프롬프트에 주입한다.
- 환경 변수: `ANTHROPIC_API_KEY`(또는 `ant auth login`), `AGENT_MODEL`, `AGENT_EFFORT`.

## 6. 렌더링 전략

- 랭킹 상세 상단 시각화는 `RankingViz`가 `pickViz` 결과로 분기한다. 지도·버블맵의 도형만 SVG이고, 글자가 있는 트리맵·스트립·발산 막대·롤리팝은 퍼센트 좌표 HTML로 그려 모바일에서도 글자 크기가 유지된다. 시각화 본체는 서버 컴포넌트이고, 클라이언트 JS는 즉시 툴팁을 띄우는 `TipLayer`(`data-tip` 속성을 읽는 작은 클라이언트 컴포넌트)뿐이다. 이름 라벨 배치(겹침 회피)는 `src/lib/labels.ts`의 `placeLabels`가 맡는다. 색은 `--bar` 단일 색 + 중립 회색(음수만 `--neg`)이며, 대륙 구분은 행(facet)으로 한다. 예외는 `Regions` 누적 막대의 대륙 고정색 `--c1`~`--c5`(dataviz `validate_palette.js` 검증 팔레트)뿐이다. 버블맵은 `lib/map.ts`의 `projectPoint`와 `data.ts`의 `countryCoords`로 국가 좌표를 투영한다.

- 카테고리 목록은 세계 랭킹(`scope` 없음)을 먼저, 국가 내부 랭킹을 다음에 표시한다. 각 그룹에서는 기존 sort 값 및 제목 순서를 유지한다.

- World Records 카테고리 페이지는 `scope`가 없는 세계 기준 랭킹만 표시한다. 국가 내부 기록은 국가 상세페이지에서 제공한다.

- 국가 요약 집계는 한 번 읽은 랭킹 목록을 재사용하여 국가 수에 비례한 JSON 재읽기를 방지한다. `countrySummaries`와 `countryDetail`은 React `cache`로 요청 안에서 중복 계산을 제거하며, 다음 요청에는 개발 중 데이터 변경을 반영한다.
- 지구본 국기의 hover/focus 및 국가 선택 시 `router.prefetch`로 해당 상세페이지를 미리 불러온다. 전체 국기 링크의 일괄 prefetch는 비활성화한다.

- 지구본 배경에서 포인터 조작을 시작하면 국가 선택과 국기 포커스를 해제하여 고정된 버블을 닫는다. 국기 및 버블 내부 조작은 상세 페이지 링크로 유지한다.

- `RankingCard`는 항목 이름을 별도 `.entry-name` 요소로 감싸 남은 너비에서 말줄임표로 표시한다. 카드와 행의 최소 너비를 0으로 설정하고 값은 축소하지 않아 긴 이름이 카드 밖으로 값을 밀어내지 않는다. 전체 이름은 title 속성으로 제공한다.
- 카드 내부 순위 배지는 `.card .rk`로 원 크기 32px, 숫자 18px를 적용한다. 상세 순위표의 공통 배지(22px/12px)는 유지한다.

- 헤더는 최대 1440px 너비에서 카테고리를 한 줄로 가운데 정렬한다 (`justify-content: safe center`). 공간이 부족하면 시작점부터 가로 스크롤할 수 있으며, 모바일에서는 카테고리 한 줄을 별도 행에서 가로 스크롤한다.

- 모든 페이지는 빌드 시 `src/lib/data.ts`가 `data/`를 읽어 정적으로 생성된다 (`generateStaticParams` 사용).
- `data.ts`는 `server-only`; 프로덕션에서는 랭킹 목록을 메모리에 캐시한다.
- `GlobeExplorer`만 클라이언트 컴포넌트이며, 서버에서 만든 `CountrySummary[]`를 props로 받는다.
- 국가 순위 집계: 1위 횟수 → 3위 이내 횟수 → 등장 횟수 → 이름순.
- 사이트 URL은 `src/lib/site.ts`의 `SITE_URL`(`NEXT_PUBLIC_SITE_URL`, 없으면 `https://allranks.world`)을 사이트맵과 `metadataBase`에서 사용한다. 호스팅은 Vercel.
- 광고: `src/lib/site.ts`의 게시자 ID(기본 `ca-pub-8335444243080631`, `NEXT_PUBLIC_ADSENSE_CLIENT`로 덮어쓰기, `off`면 비활성)가 유효하면 `layout.tsx`가 `next/script`로 AdSense 스크립트와 `google-adsense-account` 메타를 넣고 `/ads.txt` 가 활성화된다. 연락처는 기본 `allworldranks@gmail.com`이고 `NEXT_PUBLIC_CONTACT_EMAIL`로 바꿀 수 있다. 환경변수는 빌드 때 고정되므로 바꾸면 다시 빌드한다.

## 7. 확장 지점

지구본 아래에 통합 검색 폼을 제공한다. 검색 결과 페이지는 `searchCountries`, `searchRankings`, `searchEntries`로
국가·랭킹·항목을 구분한다. 국가명·ISO-2 코드로 관련 랭킹도 찾으며 항목 상세 설명을 검색 대상에 포함한다.
문자열은 NFKC 정규화 후 대소문자 구분 없이 비교한다. 항목 순위는 전체 랭킹에서 계산하며 표시 한도는 100개다.
추가 클라이언트 데이터나 API 없이 서버의 기존 JSON 로더를 사용하며 `/search`는 쿼리별 서버 렌더링된다.

홈 지구본 하단의 국가 리더보드, 선택 국가 상세 패널, 국가 선택 칩 목록을 제거했다.
`GlobeExplorer`는 지구본·국기 툴팁만 렌더링하며, 삭제된 패널과 조작 안내 전용 상태·스타일도 제거했다.
국기에서 국가 상세 페이지로 이동하는 탐색과 국가 요약 데이터 집계는 유지한다.

카테고리 등록부는 헤더 메뉴가 길어지는 것을 막기 위해 7개로 통합했다(ai는 독립 유지). prices·markets·money→`economy`, health·demographics→`society`, mining·autos·green→`energy`(Energy & Industry)로 합쳤고, 각 `data/rankings/*.json`의 `category`와 `scripts/` 파이프라인 정의도 같은 ID로 바꿨다. 헤더, 정적 카테고리 경로, 사이트맵은 등록부를 자동 반영한다.
데이터가 없는 카테고리 페이지는 분야 설명과 준비 중 안내를 표시한다. Maps는 지도 탐색 기능이므로 카테고리에서 제외한다.

| 하고 싶은 일 | 수정할 곳 |
| --- | --- |
| 자동 랭킹 추가 | `scripts/sources/`에 어댑터 → `scripts/registry.mts` 등록 → `npm run data:update -- <id>` |
| 수동 랭킹 추가 | `data/rankings/<id>.json` 작성 (`RankingFile` 준수) |
| 카테고리 추가 | `src/lib/categories.ts` |
| 새 나라의 지역 랭킹 | `scripts/regional/<cc>.mts` 작성(`rank()`+`fromTable()`) → `scripts/regional/index.mts` 에 등록 → `npm run data:update -- <cc>-<slug>` (국가 페이지가 자동 반영) |
| 항목 로고 | `public/logos/<domain>.png` + 항목에 `logo` |
| 에이전트에 새 도구/규칙 추가 | `scripts/agent/tools.mts`(도구 정의+핸들러), 지침은 `scripts/agent/prompts.mts` |

## 8. 제약과 알려진 사항

- 배포 대상/호스팅은 아직 정해지지 않음 (`project_plan.md` 참조).
- 테스트 프레임워크 없음. 현재 품질 게이트는 `tsc --noEmit` + `data:validate`.
- 데이터가 JSON 파일이므로 랭킹/항목 수가 크게 늘면 빌드 시간·저장소 크기 재검토 필요.

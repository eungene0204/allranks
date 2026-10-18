# AllRanks 소프트웨어 아키텍처

> 마지막 업데이트: 2026-10-18 · 버전 0.2.0

## 1. 개요

AllRanks는 **정적 사이트 생성(SSG)** 중심의 Next.js 앱이다. 서버 DB 없이 JSON을 사용하며, 전체 검색 결과는 동적으로 렌더링하고 검색 미리보기는 런타임 API로 제공한다.
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

홈은 현재 연도와 데이터 기준 연도(`year`)가 일치하는 세계 랭킹만 LATEST 후보로 삼아, 세부 기준 시점(`asOf`)과 파일 갱신일(`updatedAt`) 내림차순으로 최대 6개를 보여주고 해당 항목을 인기 그룹에서 제외한다. Popular rankings는 페이지뷰 분석이 없어 `lib/home-rankings.ts`의 편집 선정 목록(대중 관심도와 국가 간 비교 용이성 기준)만 사용한다. 홈에서는 방문마다 후보 중 무작위 15개를 보여주며 넓은 화면에서 한 줄에 5개, 좁은 화면에서 3·2·1개로 배치한다. `/popular` 페이지에서는 전체 선정 목록을 무작위 순서로 제공한다. 인기 랭킹과 카테고리별 랭킹 카드는 `RandomRankingCards` Client Component가 브라우저 마운트 후 Fisher–Yates 방식으로 섞는다. Popular rankings는 브라우저 뒤로가기 캐시에서 복원될 때도 다시 섞는다. LATEST 그룹은 정렬 순서를 유지한다. 서버 렌더와 hydration의 순서 불일치를 피하기 위해 첫 HTML은 입력 순서로 만들고, 무작위 표시 대상은 hydration 이후 카드 순서를 섞는다.

## 3. 디렉터리 구조

```
.github/workflows/data-agent.yml  매일 KST 00:00: 신규 랭킹 조사 → 검증 → PR 생성/누적
data/
  agent/                    에이전트 상태: notes.json(거절·후보 주제), last-run.json/.md (웹은 읽지 않음)
  countries.json            국가 참조 테이블 (mledoze/countries 기반)
  rankings/<id>.json        랭킹 1개 = 파일 1개 (현재 3,299개: 세계 1,685 + 국가 한정 1,614)
scripts/
  update.mts                랭킹 데이터 갱신 CLI (--jobs N 병렬, 기본 3)
  freshness.mts             기준 연도 신선도 점검 (data:freshness, 네트워크 없음)
  sources/globalpetrolprices.mts  휘발유 가격 HTML 차트 어댑터
  validate.mts              data/rankings 검증 (prebuild에서 자동 실행)
  countries.mts             countries.json 갱신
  registry.mts              자동 랭킹 등록부 (메타데이터 + 소스 어댑터 연결)
  expanded-worldbank.mts    2025년 이후 관측치가 확인된 세계 랭킹 92개 정의(지표 코드·설명·단위)
  worldbank-500.mts          세계 랭킹 500개 목표의 추가 지표 300개 정의(공식 지표 코드·설명·단위)
  worldbank-1024.mts         2025년 이후 국가별 관측치가 10개 이상인 지표 149개 정의
  worldbank-2048.mts         추가 세계은행 지표 1,024개 정의 (최소 10개국, 관측 기준연도별 갱신)
  topics.mts                AI·Markets·Energy·Money·Demographics·Mining·Autos·Green 랭킹 39개 정의
  regional/geonames.mts      지역 랭킹이 없는 나라의 대도시 순위(GeoNames cities15000 덤프 1회 다운로드·zip 해제, 도시 5개 미만 국가는 `NO_CITIES` 로 제외)
  regional/airports.mts      OurAirports 공개 공항·활주로 데이터에서 고도와 최장 활주로 순위(국가별 상위 50개, 최소 5개)
  regional/openalex.mts      OpenAlex 연구 영향력·논문 수·h-index·i10-index·최근 피인용도(지표별 5개 이상 기관)
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
  sources/                  소스 어댑터: worldbank, owid(Our World in Data CSV, 연도·분기 `day` 열 지원, `exclude`), epoch(Epoch AI GPU 클러스터 CSV: 국가별 개수·H100 환산 연산력·전력, 대형 클러스터; 'Superseded by' 행은 이중 집계 방지를 위해 제외), bigmac, cpi(Transparency International CPI CSV mirror), rsf(공식 페이지에서 최신 연판 CSV 발견), wikipedia-world, wikipedia-topics(wikiCountries 팩토리), wikipedia-us, wikipedia-speed
src/
  lib/site.ts                        배포 환경변수(ADSENSE_CLIENT, CONTACT_EMAIL, SITE_URL)
  app/
    layout.tsx, globals.css, not-found.tsx, sitemap.ts, robots.ts(전체 허용·`/search` 제외·사이트맵 위치)
    page.tsx                         홈 (지구본 + 랭킹 카드, 카테고리 탐색은 헤더에서 제공)
    popular/page.tsx                 전체 인기 세계 랭킹 목록
    ranking/[id]/page.tsx            랭킹 상세
    category/[id]/page.tsx           카테고리별 목록
    country/[code]/page.tsx          국가 상세 (국가 한정 랭킹 + 세계 랭킹 내 순위)
    search/page.tsx, loading.tsx     검색 결과(랭킹 48개씩 페이지 분할) 및 즉시 전환용 로딩 화면
    about / methodology / privacy    정보 페이지 (methodology는 데이터에서 출처 표 생성)
    ads.txt/route.ts                 AdSense ads.txt (환경변수 설정 시에만 200, 정적)
  components/
    GlobeExplorer.tsx   인터랙티브 지구본 (클라이언트 컴포넌트, 국기 툴팁)
    RankingCard / RankingTable / RankingViz(상단 시각화 디스패처) / RankingMap(`map`) / viz/(Treemap·Regions·Packed·Waffle·Strip·Histogram·Scatter·Diverging·Bubbles·Podium·Lollipop·Radial) / RankingInsights(표 아래 자동 해설) / RankBadge / SourceLine / Header / Mark
    CountryRegional.tsx 국가 상세의 국내 랭킹 칩 탭과 선택된 순위표
    CountryWorldRankings.tsx 국가의 세계 랭킹을 간략한 데이터로 받아 48개씩 클라이언트에서 페이지 분할
    SearchForm.tsx      홈·검색 결과 페이지 공유 검색 폼(Client Component). 입력 70ms 뒤 국가·랭킹 자동완성 제공. Enter/Search 제출 시 전체 검색 결과로 이동
    Header.tsx          로고·카테고리 탐색·검색 아이콘, 공용 생성 사전으로 활성 카테고리 표시
  lib/
    types.ts            웹과 스크립트가 공유하는 타입 (RankingFile 등)
    categories.ts       카테고리 정의 (7개로 통합: economy, education, tech, ai, society, energy, world)
    data.ts             JSON 로더 + 집계 (server-only)
    format.ts           값 포맷, 순위 계산, 국기 이모지
    map.ts              world-atlas(110m)를 Natural Earth 투영의 SVG 경로로 변환(프로세스당 1회), `data/map-codes.json`으로 도형→ISO 코드 연결
    viz.ts              랭킹 성격(단위·개수·음수·scope·multi)으로 시각화 13종 중 하나를 고르는 `pickViz`, 예외 `VIZ_OVERRIDES`, 산점도 짝 `VIZ_PAIRS`(현재 비어 있음)·축 이름 `AXIS_NAMES`
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
5. 수동 랭킹(QS 대학, 휘발유, 행복지수, 최고층 빌딩 및 출처 기사 기반 표)은 JSON을 직접 편집하며 `verified: false`면 사이트에 "Sample data"로 표시.

WIN 2026 Worldviews Survey의 국가별 반려동물 보유 응답률은 `pet-*-ownership.json` 6개 수동 랭킹으로 저장한다. 44,000건의 설문에서 응답자가 집에 해당 동물이 있다고 답한 비율이며, 국가별 표본 범위 차이와 영국 미포함을 출처 설명에 표시한다.

`imf-credit-outstanding.json`과 `imf-credit-gdp.json`은 Visual Capitalist의 2026년 10월 IMF 차입국 표에 실린 상위 26개국을 수동 스냅샷으로 보관한다. 값은 각각 미상환 IMF 신용의 USD 십억 단위와 2026년 GDP 대비 비율이며 소수 첫째 자리로 반올림되어 있다. 출처 표가 약 10억 달러 이상인 최대 차입국만 나열하므로 전체 차입국 순위로 해석하지 않는다.

Equilar CEO 보상은 `scripts/sources/equilar.mts`에서 공식 2026년판 표의 JSON API를 읽어 `us-highest-paid-ceos`로 저장한다. 정확히 100행·7열, 달러 정수·내림차순을 검증하며, CEO 이름·회사/티커·2025 회계연도 보상액을 보존한다. `scope: "US"`는 조사 대상 기업의 범위이고 CEO 국적이 아니다. `VIZ_OVERRIDES`에서 로그 축 점 분포를 지정해 CEO별 보상을 전체 범위에서 비교하고 각 점에 hover 정보를 제공한다. 아래 표의 비교 막대도 1천만 달러 기준 로그 축을 사용한다. 갱신 명령: `npm run data:update -- us-highest-paid-ceos`. 랭킹 표의 값 열은 `max-content`까지 늘어나 큰 달러 금액도 잘리지 않는다(모바일은 이름 열이 줄어듦).

재생에너지 비중(`renewable-energy`)은 OWID의 SDG 7.2.1 CSV와 World Bank API를 병렬 조회하고, 국가 10개 이상인 결과 중 가장 최신 연도의 자료를 저장한다(동일 연도면 OWID 우선). OWID 표기는 UNSD·IEA·IRENA 자료를 재배포하며, World Bank도 IEA 원자료 기반이므로 이중 경로는 제공·갱신 경로의 장애 대응에 쓰고 완전히 독립된 통계 생산원이라고 간주하지 않는다. 갱신 명령: `npm run data:update -- renewable-energy`.

`Pipeline.fallbacks`는 같은 지표의 독립 제공 경로를 등록하며 `update.mts`는 주 소스와 폴백을 병렬 조회해 파이프라인별 최소 기준연도 이상인 최신 자료를 채택한다. 기본 `minYear`는 2025다. 단, `scripts/regional/lib.mts`의 국가별 통계 파이프라인은 실제 연도를 표시하는 조건으로 2020년 이후 공개된 역사·지역 자료도 보존한다. 국가별 공통 보강 자료는 OpenAlex의 연구량·영향력 지표 네 가지, GeoNames의 도시 고도, OurAirports의 공항 고도·활주로 길이를 사용한다. OpenAlex와 공항 지표는 비교할 기관·공항이 5개 이상인 경우에만, 도시·공항 목록은 상위 50개까지만 저장한다. 모든 목록은 원자료의 출처·라이선스·측정 한계를 노출한다. World Bank 어댑터는 최소 지정연도부터 현재 연도까지 조회하고, 같은 해 국가 관측치가 최소 10개인 가장 최근 연도를 선택한다. 페이지에는 실제 기준연도를 표시한다. 세계은행 확장 카탈로그는 국가별 값이 모두 동일한 시계열을 제외하며, 이진 정책 지표는 1/0을 Yes/No로 표시한다. 모든 자동 랭킹의 저장 JSON은 소스 장애 중 쓸 수 있는 마지막 스냅샷이다. 모든 조회가 실패하면 최소 기준연도에 부합하는 스냅샷만 보존하고, 적합한 자료가 없으면 오래된 랭킹 JSON을 제거한다. 파이프라인 정의는 유지해 새 자료 공개 후 다시 생성한다. `renewable-energy`는 OWID와 World Bank 경로를 함께 조회하며, `renewable-electricity`는 Ember/OWID를 주 경로로 World Bank 지표를 폴백으로 등록한다. 같은 원자료를 재배포하는 경우 독립 통계 생산원으로 간주하지 않는다. `expanded-worldbank.mts`, `worldbank-500.mts`, `worldbank-1024.mts`에 등록한 확장 지표는 공식 API의 2025년 이후 국가별 관측치를 사용한다. `worldbank-2048.mts`에는 세계은행의 다른 공식 통계 카탈로그에서 고른 1,024개 추가 시계열을 등록한다. 값은 단일 기준연도에서 선택하며 각 JSON에 지표 페이지 링크, 기준연도, 갱신 시각을 저장한다. 현재 세계 1,685개와 국가 한정 1,614개로 총 3,299개 랭킹이다. 독립국 194개 중 178개국에 국내 랭킹이 있고, 73개국이 10개 이상을 제공한다.

### 5.1 데이터 수집 에이전트

```
npm run agent -- run          (수동 전체 갱신+발굴; 일일 스케줄은 discover)
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

- 랭킹 상세 상단 시각화는 `RankingViz`가 `pickViz` 결과로 분기한다. 지도·버블맵의 도형만 SVG이고, 글자가 있는 트리맵·스트립·발산 막대·방사형 리더보드는 SVG 도형과 HTML 범례로 그려 모바일에서도 글자 크기가 유지된다. 시각화 본체는 서버 컴포넌트이고, 클라이언트 JS는 즉시 툴팁을 띄우는 `TipLayer`(`data-tip` 속성을 읽는 작은 클라이언트 컴포넌트)뿐이다. 이름 라벨 배치(겹침 회피)는 `src/lib/labels.ts`의 `placeLabels`가 맡는다. 색은 `--bar` 단일 색 + 중립 회색(음수만 `--neg`)이며, 대륙 구분은 행(facet)으로 한다. 예외는 `Regions` 누적 막대의 대륙 고정색 `--c1`~`--c5`(dataviz `validate_palette.js` 검증 팔레트)뿐이다. 버블맵은 `lib/map.ts`의 `projectPoint`와 `data.ts`의 `countryCoords`로 국가 좌표를 투영한다.

- 카테고리 목록은 세계 랭킹(`scope` 없음)을 먼저, 국가 내부 랭킹을 다음에 표시한다. 각 그룹에서는 기존 sort 값 및 제목 순서를 유지한다.

- World Records 카테고리 페이지는 `scope`가 없는 세계 기준 랭킹만 표시한다. 국가 내부 기록은 국가 상세페이지에서 제공한다.

- 랭킹 JSON은 프로세스 캐시를 사용한다. 개발에서는 1초 간격으로 파일명·mtime·크기를 확인하고 변경 시 새 랭킹 배열을 만든다. `countrySummaries`와 `countryDetail`은 React 요청 캐시와 랭킹 배열을 키로 하는 WeakMap 캐시를 함께 사용해 요청 간 집계도 재사용한다. 국가별 랭킹 중복 집계는 랭킹별 Map으로 처리한다. `ranked`는 랭킹 객체별 정렬 결과를 WeakMap에 보관하고, `formatValue`는 소수 자릿수별 Intl.NumberFormat 인스턴스를 재사용한다.
- 지구본 국기의 hover/focus 및 국가 선택 시 `router.prefetch`로 해당 상세페이지를 미리 불러온다. 전체 국기 링크의 일괄 prefetch는 비활성화한다.

- 지구본 배경에서 포인터 조작을 시작하면 국가 선택과 국기 포커스를 해제하여 고정된 버블을 닫는다. 국기 및 버블 내부 조작은 상세 페이지 링크로 유지한다.

- `RankingCard`는 항목 이름을 별도 `.entry-name` 요소로 감싸 남은 너비에서 말줄임표로 표시한다. 카드와 행의 최소 너비를 0으로 설정하고 값은 축소하지 않아 긴 이름이 카드 밖으로 값을 밀어내지 않는다. 전체 이름은 title 속성으로 제공한다.
- 카드 내부 순위 배지는 `.card .rk`로 원 크기 32px, 숫자 18px를 적용한다. 상세 순위표의 공통 배지(22px/12px)는 유지한다.

- 헤더는 최대 1440px 너비에서 카테고리를 한 줄로 가운데 정렬한다 (`justify-content: safe center`). 공간이 부족하면 시작점부터 가로 스크롤할 수 있으며, 모바일에서는 카테고리 한 줄을 별도 행에서 가로 스크롤한다.

- 모든 페이지는 빌드 시 `src/lib/data.ts`가 `data/`를 읽어 정적으로 생성된다 (`generateStaticParams` 사용).
- `data.ts`는 `server-only`; 프로덕션에서는 랭킹 목록을 메모리에 캐시한다.
- `GlobeExplorer`는 서버에서 축약한 `GlobeCountry[]`를 받는 클라이언트 컴포넌트다. 국가별 전체 랭킹 이력 대신 요약 6개·1위 배지 3개·지역 아이콘 8개와 전체 개수만 전달해 랭킹 증가에 따른 직렬화·hydration 비용을 제한한다.
- 국기 툴팁은 `src/app/globals.css`에서 최대 360px(화면 폭이 좁으면 화면 너비에서 좌우 여백을 뺀 폭)로 제한한다. 긴 랭킹 제목이 `min-width:max-content`로 툴팁 폭을 밀어내지 않도록 최소 너비를 0으로 두고 텍스트를 말줄임 처리한다.
- 지구본은 Canvas와 d3 orthographic 투영을 유지한다. 회전·드래그·줌 중에는 110m 지도와 완화된 투영 정밀도를 사용하고 확대 정지 상태에서는 비동기로 로드한 50m 지도로 전환한다. 투영은 캔버스 영역으로 클리핑한다.
- 국기 라벨 정렬·문자 폭을 캐시한다. 국기 링크는 원래의 `left/top` 좌표와 Canvas 이모지 렌더링을 유지하며, 표시·히트 영역 변경만 반영한다. 숨긴 국기 링크는 키보드 탐색에서 제외한다.
- 회전·줌 보간은 rAF 경과 시간 기준이며 휠/핀치 조작 시 자동 회전을 종료한다. 화면 밖·비활성 탭에서는 그리기를 생략한다. 지구본 영역의 터치 드래그는 브라우저 페이지 스크롤 대신 지구본 회전에 사용한다.
- 국가 순위 집계: 1위 횟수 → 3위 이내 횟수 → 등장 횟수 → 이름순.
- 사이트 URL은 `src/lib/site.ts`의 `SITE_URL`(`NEXT_PUBLIC_SITE_URL`, 없으면 `https://allranks.world`)을 사이트맵과 `metadataBase`에서 사용한다. 호스팅은 Vercel.
- 서비스 브랜드 마크는 `public/brand/logo-r-c-512.png` 한 자산을 헤더와 `src/app/icon.png` 앱 아이콘에서 공유한다. 헤더는 마크 옆에 서비스명을 표시한다.
- 랭킹 제목 렌더링에서는 `Ranking.icon`을 제목 앞에 표시하지 않는다. 상세 페이지, 검색 결과 항목, 국가 내부 랭킹 탭 제목이 이 규칙을 따른다. 카테고리 메뉴와 카드의 분류 태그는 기존 아이콘을 유지한다.
- 프로덕션 배포는 Vercel CLI로 수행한다. 2026-10-17 기준 구형 CLI 59.15.1은 `Not authorized`를 반환했고 최신 CLI 64.5.0은 같은 계정/프로젝트에서 성공했다. 재현 가능한 명령은 README에 기록한다.
- 광고: `src/lib/site.ts`의 게시자 ID(기본 `ca-pub-8335444243080631`, `NEXT_PUBLIC_ADSENSE_CLIENT`로 덮어쓰기, `off`면 비활성)가 유효하면 `layout.tsx`가 `next/script`로 AdSense 스크립트와 `google-adsense-account` 메타를 넣고 `/ads.txt` 가 활성화된다. 연락처는 기본 `allworldranks@gmail.com`이고 `NEXT_PUBLIC_CONTACT_EMAIL`로 바꿀 수 있다. 환경변수는 빌드 때 고정되므로 바꾸면 다시 빌드한다.

## 7. 확장 지점

홈 및 검색 결과 페이지가 공유하는 `SearchForm`은 입력 상태를 가진 Client Component다. 2글자부터 70ms 디바운스 API 요청으로 국가 최대 4개와 관련 랭킹 최대 6개를 검색창 아래에 표시한다. 입력 중에는 페이지를 이동하지 않으며 Enter/Search 또는 전체 결과 링크를 통해 `/search?q=…`로 이동한다. 미리보기는 국가명·랭킹 제목·소속 국가·항목 이름·분류·ID를 부분 검색하고, 일치한 항목/국가와 분류를 함께 표시한다. 서버는 정규화된 검색 필드를 메모리에 한 번 색인하고, 클라이언트는 최근 검색 응답을 재사용한다. 이전 요청은 AbortController로 취소하고 검색어가 다른 응답은 표시하지 않는다. 포커스를 벗어나거나 Escape를 누르면 미리보기를 닫고 재포커스 시 다시 연다.

홈 소개 문구는 `src/app/page.tsx`의 제목 “No country tops everything.”와 설명 “From universities to GDP, fuel to Big Macs — discover where each country stands.”로 구성한다.
홈 상단 배지는 `allRankings()` 전체 개수를 표시하고, 최신·인기 카드 입력은 `scope`가 없는 세계 랭킹만 사용한다. 따라서 전체 랭킹 수에는 국가 내 지역 랭킹도 포함된다.

헤더 오른쪽에는 돋보기 버튼을 제공하며, 누르면 기존 `SearchForm`이 작은 패널로 열린다. 홈 지구본 아래, Popular rankings 위, 검색 결과 페이지에는 통합 검색 폼을 제공한다. 검색 결과 페이지는 `searchCountries`, `searchRankings`, `searchEntries`로
국가·랭킹·항목을 구분한다. 국가명·ISO-2 코드로 관련 랭킹도 찾으며 항목 상세 설명을 검색 대상에 포함한다. 전체 검색도 정규화 필드·항목 순위·국가별 랭킹 개수를 서버 메모리에 색인해 재사용한다. 국가 상세 집계(`countrySummaries`)를 검색 요청에서 호출하지 않는다. 개발에서는 5초 후 색인을 다시 만들어 JSON 변경을 반영하고, 프로덕션에서는 프로세스 수명 동안 재사용한다.
문자열은 NFKC 정규화 후 대소문자 구분 없이 비교한다. 검색어는 필드 내부 부분 일치와 단어 시작 부분 일치를 모두 허용해 짧은 단어 조각으로도 결과를 찾는다. 랭킹 검색은 ID·단위·출처명·출처 설명도 대상으로 하므로 `pet`이나 `cat`으로 반려동물 랭킹을 찾을 수 있다. 항목 순위는 전체 랭킹에서 계산하며 표시 한도는 100개다. 랭킹 카드는 `page` 쿼리로 48개씩 표시하고 전체 개수·현재 범위·이전/다음 링크를 제공한다.
서버의 기존 JSON 로더를 사용하며 `/search`는 쿼리별 서버 렌더링된다. `/api/search-suggestions`는 간략한 국가·랭킹 링크와 일치 맥락만 반환하며, 전체 색인을 브라우저에 보내지 않는다. 전체 결과는 명시적 제출 시 App Router 탐색으로 표시한다.

홈 지구본 하단의 국가 리더보드, 선택 국가 상세 패널, 국가 선택 칩 목록을 제거했다.
`GlobeExplorer`는 지구본·국기 툴팁만 렌더링하며, 삭제된 패널과 조작 안내 전용 상태·스타일도 제거했다.
국기에서 국가 상세 페이지로 이동하는 탐색과 국가 요약 데이터 집계는 유지한다.

현재 카테고리 등록부는 8개 상단 메뉴를 정의한다. Markets는 주식시장 규모·거래, 상장사·기업 매출, 외국인 직접·포트폴리오 투자, 가계 소비시장, 시장 경쟁 지표를 모은다. 이 랭킹들의 JSON과 자동 수집 파이프라인 정의는 모두 `markets` 카테고리를 사용한다. 헤더, 정적 카테고리 경로, 사이트맵은 등록부를 자동 반영한다. 과거 분류 변경 내역은 프로젝트 계획 이력에 기록한다.
World Records는 `src/lib/categories.ts`의 `WORLD_RECORD_RANKING_IDS`로 다른 분야의 국가 간 규모·최고 기록 랭킹을 함께 보여준다. 원래 카테고리 소속은 유지하며 `rankingsIn("world")`에서만 기존 세계 기준 항목과 합친다. 현재 World Records 고유 랭킹 8개와 다른 분야에서 고른 62개(일부는 중복)를 합쳐 고유 랭킹 65개를 표시한다. 국가 한정 랭킹과 카탈로그에 없는 ID는 제외한다.
데이터가 없는 카테고리 페이지는 분야 설명과 준비 중 안내를 표시한다. Maps는 지도 탐색 기능이므로 카테고리에서 제외한다.

| 하고 싶은 일 | 수정할 곳 |
| --- | --- |
| 전체 최신화 | 스킬 `data-refresh`: `npm run data:update` → `npm run data:freshness` → 수동 랭킹 재조사 |
| 자동 랭킹 추가 | `scripts/sources/`에 어댑터 → `scripts/registry.mts` 등록 → `npm run data:update -- <id>` |
| 수동 랭킹 추가 | `data/rankings/<id>.json` 작성 (`RankingFile` 준수) |
| 카테고리 추가 | `src/lib/categories.ts` |
| 새 나라의 지역 랭킹 | `scripts/regional/<cc>.mts` 작성(`rank()`+`fromTable()`) → `scripts/regional/index.mts` 에 등록 → `npm run data:update -- <cc>-<slug>` (국가 페이지가 자동 반영) |
| 항목 로고 | `public/logos/<domain>.png` + 항목에 `logo` |
| 에이전트에 새 도구/규칙 추가 | `scripts/agent/tools.mts`(도구 정의+핸들러), 지침은 `scripts/agent/prompts.mts` |

## 8. 제약과 알려진 사항

- 배포 대상은 Vercel이며 프로덕션 도메인은 `allranks.world`다 (`project_plan.md` 참조).
- 테스트 프레임워크 없음. 현재 품질 게이트는 `tsc --noEmit` + `data:validate`.
- 데이터가 JSON 파일이므로 랭킹/항목 수가 크게 늘면 빌드 시간·저장소 크기 재검토 필요.

### 2026-10-18 배포 저장 공간 조사 및 최적화

- 기존 로컬 `.next/server/app`의 HTML·RSC 논리 파일 크기 합계는 2,871,597,877 bytes(약 2.87 GB)다. `.next` 전체 디스크 사용량이나 Vercel 과금 저장량과는 다른 측정값이며 새 빌드는 실행하지 않았다. 기존 `.vercel/output`은 HTML 1,109개인 이전 산출물이어서 현재 `.next`(HTML 3,523개)와 합산·직접 비교하지 않는다.
- `RootLayout` → Client `Header`의 `rankingCategories`는 3,289개 ID→카테고리 사전 전체를 직렬화한다. 사전 JSON은 117,497 bytes이며, 로컬 HTML 3,522개와 RSC 10,566개에서 필드가 반복되어 총 1,701,921,972 bytes(위 HTML·RSC의 약 59%)를 차지한다. 우선 개선안은 이 사전을 빌드 시 생성하는 공용 JS/JSON 자산으로 분리해 페이지마다 props로 포함하지 않는 것이다.
- `RandomRankingCards`는 카드에 상위 3개만 표시하면서 전체 `Ranking[]`를 전달받는다. 카드 전용 요약 모델(ID·제목·카테고리·상위 3개·전체 항목 수·연도 등)로 전환하는 것이 다음 개선안이다. `CountryRegional`은 모든 탭의 전체 데이터, `CountryWorldRankings`는 모든 페이지의 행을 초기 props에 담으므로 비활성 탭·후속 페이지를 요청 시 불러오는 방식도 검토한다.
- 배포 `dpl_3YUvcJ1d1xPzVjr8ngYo5tWGuW2y`의 `vercel inspect --json` 출력은 lambda 항목 21,145개지만 고유 digest는 2개이며, 고유 번들 크기 합계는 15,015,369 bytes다. CLI의 `λ … (7.41MB)`는 공유 함수 번들 크기이므로 개별 RSC 응답 크기나 출력 개수와 곱해 배포 저장량을 추산하면 안 된다.
- 조사 시 대시보드의 allranks 필터 값은 17.59 GB다. CLI 청구 데이터 조회는 해당 기간 데이터 없음으로 실패했다. 로컬 파일 합계를 이 값과 동일시하지 않으며 실제 절감량은 최적화 후 동일 조건 빌드와 Vercel 지표로 별도 확인한다.

구현: `scripts/ranking-catalog.mts`가 데이터에서 ID→카테고리 사전을 생성하고, `next.config.ts` 로딩 시와 `npm run lint` 이전에 갱신한다. 생성 파일 `src/generated/ranking-categories.json`은 Git에서 제외하며 `Header`가 공용 클라이언트 모듈로 import한다. `RootLayout`은 더 이상 사전을 props로 전달하지 않는다. `src/lib/ranking-card.ts`의 서버 전용 `toRankingCard`는 `RankingCardData`(표시 메타데이터·전체 항목 수·정렬/포맷이 완료된 상위 3개)만 반환하며 홈·인기·카테고리·검색에서 사용한다. 섞기·개수 제한·복귀 시 재섞기·카테고리 강조 동작은 유지한다. 국가 탭과 국가 목록 데이터 로딩 변경은 후속 후보로 남긴다.

검증: `npm run lint`, `npm run build` 성공(정적 페이지 생성 3,529개, 데이터 검증 3,289개 오류 0·기존 경고 2). 빌드 후 HTML·RSC 합계는 1,104,186,172 bytes로 기존 2,871,597,877 bytes 대비 61.55% 감소했으며, `rankingCategories` props 필드가 남은 HTML·RSC는 0개다. 인구 페이지 RSC는 141,437→24,041 bytes, 교육 카테고리 RSC는 6,537,139→586,277 bytes다. 로컬 프로덕션 서버에서 홈·랭킹·카테고리·인기·국가·검색 HTTP 200, 자동완성 결과, 잘못된 랭킹 404, 서버 렌더의 카테고리 강조와 생성 사전 3,289개 일치를 확인했다. 브라우저 연결이 없어 실제 브라우저 상호작용 검증은 수행하지 않았다.

배포: `vercel deploy --prod --yes`로 `dpl_57d9BKz9GHofpzT5u9W6n3UtfJFR`를 배포했다. `allranks.world`가 새 READY 배포를 가리키는 것을 확인하고 실제 도메인의 홈·랭킹·카테고리·인기·국가·검색, 자동완성 API, 홈의 Next.js 스크립트 응답을 확인했다. 이전 배포에 남아 있던 `allranks-git-main-eugene204-5519.vercel.app` 별칭도 새 배포로 옮긴 뒤, 이전 배포 `dpl_3YUvcJ1d1xPzVjr8ngYo5tWGuW2y`를 `--safe`로 삭제했다. 배포 목록에는 새 배포 1개만 남았다. 실제 Vercel Storage 갱신값은 별도 확인 대상이다.


`rsf.mts`는 RSF 공식 인덱스에서 최신 연도 CSV 링크를 찾아 ISO-3 코드로 정규화한 뒤 세계 언론자유 점수를 저장한다. `cpi.mts`는 Transparency International의 최신 CPI 연판을 출처·변환 내역이 명시된 Nations Inquiry 데이터 인덱스에서 찾아 CSV로 읽는다. 2026-10-16 현재 새 파이프라인은 각각 2026년 177개국, 2025년 182개국을 수집한다.

검색 이동 지연 개선: `SearchForm`은 포커스 시 `/search` 로딩 화면을, 입력이 200ms 멈추면 해당 쿼리의 결과 경로를 `router.prefetch`로 준비한다. Enter/Search 제출에는 디바운스를 적용하지 않는다. `search/loading.tsx`가 결과 준비 중 즉시 표시할 화면을 제공한다.

국가 페이지 전환 개선: 국가 메타데이터는 `countryInfo`의 이름만으로 짧은 설명을 만들며 상세 집계를 호출하거나 전체 랭킹 제목을 나열하지 않는다. 국가의 세계 랭킹은 간략한 카드 데이터만 Client Component에 전달하고 한 화면에 48개씩 표시한다. 국가·랭킹 경로에 `loading.tsx`를 두어 전환 상태를 제공한다. 검색 후보 링크는 기본 prefetch를 사용한다. 포커스 이동의 relatedTarget이 null일 때 자동완성을 닫지 않으며, 외부 pointerdown·명확한 외부 포커스·Escape에서 닫아 클릭 전에 링크가 사라지는 문제를 막는다.

### 2026-10-18 WIPO 세계혁신지수 추가

- 공식 GII 2026 엑셀의 `Data` 시트에서 종합·투입·산출 및 7개 pillar 점수를 가져와 10개 JSON 랭킹을 제공한다. 각 목록은 139개 경제권 전체를 포함하며 기존 데이터 로더가 검색·국가·카테고리·사이트맵에 반영한다.
- `python3 scripts/import-gii.py [공식.xlsx]`로 재수집한다. 경로 생략 시 WIPO 공식 배포 파일을 다운로드한다. Python 표준 ZIP/XML 모듈만 사용하며 외부 의존성이 없다. 139행·국가 매칭·중복·0–100 범위·공식 순위와 점수 정렬·종합 상위 5개국을 확인하고 전체 지표 검증 후 기록한다. 동일 데이터 재실행 시 갱신일을 보존한다.
- 에디션별 검토 수집으로 `source.kind: manual`, `verified: true`를 사용한다. 정기 Node 갱신 파이프라인에는 등록하지 않았으며 다음 판은 별도 검토가 필요하다. `year: 2026`은 보고서 판 연도이고 하위 통계는 서로 다른 관측연도를 사용함을 출처에 명시한다.

### 2026-10-18 일일 랭킹 추가 스케줄

GitHub Actions `data-agent.yml`의 예약 실행은 `0 15 * * *`(UTC), 즉 매일 한국시간 00:00이다. `discover`로 최신 공식 자료를 우선 조사해 실행당 최대 3개를 추가하고, 데이터/타입 검증 후 `agent/data-update` PR을 생성·갱신한다. 미병합 브랜치가 있으면 해당 자료를 이어받아 전날 추가분 유실·중복 발굴을 방지한다. 수동 실행에서는 기존 `plan/refresh/run`도 선택 가능하다. API 키 미등록은 명시적 오류로 중단한다. 예약 실행은 기본 브랜치 반영 이후 적용되며 GitHub 부하에 따라 지연될 수 있다. 현재 저장소 API 확인 결과 Actions 시크릿 0개, PR 생성 허용 비활성으로 실제 가동은 미완료다.

### 2026-10-18 홈 히어로 디자인

홈 서버 컴포넌트의 제목을 두 줄로 구성하고 `everything`에 테마 강조색을 적용한다. `home-hero` 전용 CSS로 반응형 타이포그래피, 통계 라벨, 지구본으로 이어지는 장식선을 제공하며 추가 클라이언트 코드나 이미지 의존성은 없다. 장식은 접근성 트리에서 제외하고 섹션은 제목과 연결한다.

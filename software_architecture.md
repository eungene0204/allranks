# AllRanks 소프트웨어 아키텍처

2026-10-25: 공식 WJP Rule of Law Index 2026 CSV의 전체 점수 행을 대조해 143개국·관할구역을 `wjp-rule-of-law-index-2026`에 추가했다. 원점수는 0–1이며 정렬은 내림차순이다. CSV 원본 검증 기록은 ranking JSON에, URL 접근 상태는 `data/editorial/source-access.json`에 둔다. Kosovo는 ISO-3 `XKX`에서 ISO-2 `XK`로 연결했다.

2026-10-23: 랭킹 상세 JSON-LD는 AllRanks를 편집 해설 작성자로 표시한다. 출처 라이선스가 확인된 자료만 `Dataset`으로 표시하며, 라이선스 미기재 자료는 `Article`에서 원출처를 직접 연결한다. 미기재 라이선스는 추정하지 않는다.

2026-10-23: 모든 랭킹 상세 페이지의 본문 순서를 통일했다. 지원되는 추이 그래프·랭킹 시각화·수치 비교·전체 순위표를 해석 섹션보다 먼저 렌더링하고, 요약·포함 범위·심층 편집 해설을 그 뒤에 둔다. 출처와 방법론 문맥은 페이지 하단에 유지한다.

2026-10-23: Visual Capitalist의 2026년 세계 고성장 경제 목록을 `fastest-growing-economies-2026`로 추가했다. IMF October 2026 WEO 실질 GDP 성장률 전망 18개를 출처 차트의 순서로 저장하며, 같은 전망값의 표기 순서도 유지한다. 기존 상세 페이지의 `RankingCoverage`·`RankingReading` 심층 해설, 비교 그래프, 순위표, 출처·정의 문맥이 그대로 적용된다. 전망치이며 전 세계 모든 경제를 포괄하지 않는 선정 목록임을 데이터 설명과 본문에 표시한다. Visual Capitalist 원 URL은 Cloudflare가 직접 열람을 막아 동일 차트의 Voronoi 게시 페이지 및 그래픽과 IMF 원자료를 교차 확인했다.

> 마지막 업데이트: 2026-10-25 · 버전 0.2.0

## 1. 개요

AllRanks는 **정적 사이트 생성(SSG)** 중심의 Next.js 앱이다. 서버 DB 없이 JSON을 사용하며, 전체 검색 결과는 동적으로 렌더링하고 검색 미리보기는 런타임 API로 제공한다.
모든 데이터는 저장소 안의 JSON 파일이며, 빌드 시점 또는 첫 요청 시점에 읽어 페이지를 생성·캐시한다.
데이터 갱신은 별도의 Node 스크립트 파이프라인이 담당한다. World Bank/Our World in Data 연도별 변화 조회만 런타임 API를 사용한다.

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

홈은 가장 최근에 추가·갱신된 세계 랭킹을 `updatedAt` 기준으로 LATEST 첫 카드에 항상 표시하고, 나머지 자리는 현재 연도와 데이터 기준 연도(`year`) 또는 출판 판본 연도(`editionYear`)가 일치하는 랭킹 및 현재 연도에 발표된 검증된 다음 연도 판본으로 채워 최대 3개를 보여준다. 전체 최신 목록은 `/latest`에서 제공한다. `/latest`는 자동 최신 목록에 편집 등록한 최근 추가 역사 자료도 포함할 수 있다. 아이비리그 입학률 2022 랭킹은 `RECENTLY_ADDED_LATEST_IDS`에 등록하며, 실제 데이터 기준연도와 “Historical data” 배지는 유지해 최신 자료와 구분한다. 홈 LATEST에는 More 링크를 표시하지 않는다. 홈의 Popular 미리보기는 LATEST에 표시된 3개와만 중복을 제외한다. Popular rankings는 페이지뷰 분석이 없어 `lib/home-rankings.ts`의 편집 선정 목록(대중 관심도와 국가 간 비교 용이성 기준)만 사용한다. 홈에서는 방문마다 후보 중 무작위 15개를 보여주며 넓은 화면에서 한 줄에 5개, 좁은 화면에서 3·2·1개로 배치한다. `/popular` 페이지에서는 전체 선정 목록을 무작위 순서로 제공한다. 인기 랭킹과 카테고리별 랭킹 카드는 `RandomRankingCards` Client Component가 브라우저 마운트 후 Fisher–Yates 방식으로 섞는다. Popular rankings는 브라우저 뒤로가기 캐시에서 복원될 때도 다시 섞는다. LATEST 그룹은 정렬 순서를 유지한다. 서버 렌더와 hydration의 순서 불일치를 피하기 위해 첫 HTML은 입력 순서로 만들고, 무작위 표시 대상은 hydration 이후 카드 순서를 섞는다.

2026-10-19 총기 관련 랭킹 2개를 추가했다. `scripts/topics.mts`의 OWID CSV 어댑터가 UNODC 기반 `homicide-rates-from-firearms` 및 `homicides-by-firearm` 시계열에서 최신 공통 연도 2023 자료를 가져온다. 살인율에는 히스토그램, 건수 합계에는 지역별 누적 시각화를 사용한다. 추가 총기 자료는 `scripts/sources/firearms.mts`에서 가져온다. OAS 지표 페이지에서 2024년 행만 파싱해 미주 29개국의 reported firearm-homicide counts/rates를 별도 세계 목록으로 만든다. CDC Socrata resource `489q-934x`에서는 2025년 분기별 주별 잠정률 가운데 50개 이상 주 자료가 있는 가장 최근의 12개월 기간을 고르며, 연령 보정·비보정 모두 수집한다. CDC 지표는 모든 의도의 총기 사망이며 잠정 수정될 수 있다.

2026-10-19 저장 공간 개선 후 랭킹 상세 경로는 `generateStaticParams()`로 홈 최신·인기 선정 ID만 미리 생성하고 `dynamicParams = true`로 나머지 ID를 첫 요청에 생성·캐시한다. 이렇게 하면 개발 서버가 실행된 뒤 JSON 파일로 추가한 랭킹도 즉시 열리며, 실제 존재 여부는 `getRanking()`과 `notFound()`가 판정한다.

랭킹 데이터는 기본적으로 국가별 수치지만, `entityType`은 국가를 직접 순위화하지 않는 전 세계 엔터티 목록도 지원한다. `language`는 국가 코드 없는 언어 목록이며 `port`는 항목에 국가 코드와 국가명을 보조 정보로 담을 수 있다. 두 엔터티 순위 모두 카드·표·방사형 시각화·검색에 표시하고 국가 요약·국가 상세·지도·연간 국가 추이 집계에서는 제외한다. `editionYear`는 실제 관측연도와 구분되는 출판 판본 연도를 표현하며 LATEST 자동 선정과 freshness 배지에 사용한다.

2026-10-20 세계 컨테이너 항만 순위: Visual Capitalist가 인용한 Lloyd’s List One Hundred Ports 2025 자료에서 2024년 TEU 처리량 상위 20개 항만을 수동 등록했다. 수치는 백만 TEU로 표시하고 항만을 국가 순위·지도·국가별 출현 집계에 포함하지 않는다.

2026-10-20 생활 필수품 카테고리와 제품 브랜드 엔터티: 헤더/카테고리에 `everyday`(Everyday Essentials)를 추가하고 `entityType: "product"`를 전역 엔터티 타입으로 확장했다. 제품 브랜드는 국가 코드가 필요 없고 국가별 집계·지도에서 제외된다. 비누·샴푸·세탁·주방 세제·치약·화장지·생리대·데오도란트·보습제·선크림 10개 목록을 카테고리 첫 순서에 두고, 자동차·헬멧 등은 후순위다. `verified:true` 목록 10개는 AllRanks 어시스턴트가 각 항목·선정 문맥·순서·연도를 링크된 출처와 대조한 상태다.
- 2026-10-20 제품 순위 검증 상태 표시: 검증 완료된 제품 목록과 미검증 편집 표본을 `source.verified`로 구분한다. 미검증 수동 자료는 “Editorial shortlist · verification pending”으로 표시하고, 제품 해설은 출처의 순서를 따르며 부문별 추천은 직접 비교가 아닐 수 있음을 밝힌다.
- 2026-10-20 자동차 브랜드 순위: Consumer Reports 공식 2026 Overall Brand Report Card의 상위 5개(Subaru, BMW, Porsche, Honda, Toyota)를 순서·근거와 함께 대조해 검증 상태로 갱신했다. 미국 시장의 브랜드 종합 평가이며 모델별 추천과 구분한다.

2026-10-19 공통 `formatValue()`는 설정된 소수점 자리수로 비영(非零) 값이 0으로 반올림될 때만 최대 6자리까지 표시 정밀도를 늘린다. 작은 단위 환산값이 실제 0처럼 보이지 않게 하며 정렬·저장 값은 바꾸지 않는다.

신선도 배지(`.freshness-badge`)는 작은 라벨로 보이도록 10px 글꼴과 2px × 7px 패딩을 사용한다. 현재/과거 데이터 유형별 색상 구분은 유지한다.

헤더 검색 패널은 `Header`가 열림 상태를 관리하고 패널 외부 포인터 입력 또는 Escape 키에서 닫는다. 압축형 검색 폼은 기본 검색 폼 스타일보다 구체적인 CSS 선택자로 12px 글꼴과 작은 입력 패딩을 적용한다.

2026-10-19 자료 시점/추이: 2026년 이전에 관측된 JSON 1,851개를 복원했다(총 3,309개). `FreshnessBadge`는 `year`가 현재 연도 이상이면 “Latest published data”, 그보다 이르면 “Historical data”로 카드·국가·검색·상세 페이지에 표시한다. 이는 관측/보고 기준연도의 분류이며 `updatedAt`과 구별한다. `RankingHistory`는 출처 URL이 World Bank 지표 또는 OWID Grapher인 세계 단일 국가값 랭킹에서만 렌더링한다. `/api/ranking-history/[id]?country=XX`는 등록된 랭킹의 국가만 허용하고 원출처의 국가별 연간 시계열을 24시간 캐시한다. 저장 스냅샷과 원본 기준연도 값을 비교해 단위 배율을 확인하고, 불일치하면 추이를 반환하지 않는다. 연도별 순위는 해당 연도에 값이 있는 국가를 대상으로 `order` 방향과 국가명 동점 정렬을 적용하고 비교 국가 수를 함께 반환한다. 이전 데이터 수정 가능성과 연속 연도만의 순위 변화 계산을 화면에 안내한다. `scripts/update.mts`는 적격 자료가 없을 때 이전 스냅샷을 삭제하지 않고, 더 오래된 응답으로 기존 파일을 교체하지 않는다. 시계열이 없는 Wikipedia·수동·지역·목록형 자료에는 추이를 합성하지 않는다.

## 3. 디렉터리 구조

```
.github/workflows/data-agent.yml  수동 랭킹 조사 (일일 실행은 로컬 LaunchAgent)
data/
  agent/                    에이전트 상태: notes.json(거절·후보 주제), last-run.json/.md (웹은 읽지 않음)
  countries.json            국가 참조 테이블 (mledoze/countries 기반)
  rankings/<id>.json        랭킹 1개 = 파일 1개 (현재 3,318개: 세계 1,702 + 국가 한정 1,616)
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
  oddities.mts              특이 주제 세계 랭킹 10개 정의(식품 공급·폐기물·우주 발사), OWID CSV 어댑터 사용
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
    layout.tsx, globals.css, not-found.tsx, sitemap.ts, robots.ts(전체 허용·검색 포함·사이트맵 위치)
    page.tsx                         홈 (지구본 + 랭킹 카드, 카테고리 탐색은 헤더에서 제공)
    popular/page.tsx                 전체 인기 세계 랭킹 목록
    latest/page.tsx                  전체 최신 세계 랭킹 목록
    ranking/[id]/page.tsx            랭킹 상세
    category/[id]/page.tsx           카테고리별 목록
    country/[code]/page.tsx          국가 상세 (국가 한정 랭킹 + 세계 랭킹 내 순위)
    search/page.tsx, loading.tsx     검색 결과(랭킹 48개씩 페이지 분할) 및 즉시 전환용 로딩 화면
    about / methodology / privacy    정보 페이지 (methodology는 데이터에서 출처 표 생성)
    ads.txt/route.ts                 AdSense ads.txt (환경변수 설정 시에만 200, 정적)
  components/
    GlobeExplorer.tsx   인터랙티브 지구본 (클라이언트 컴포넌트, 국기 툴팁)
    RankingCard / RankingTable / RankingViz(상단 시각화 디스패처) / RankingMap(`map`) / viz/(Treemap·Regions·Packed·Waffle·Strip·Histogram·Scatter·Diverging·Bubbles·Podium·Lollipop·Radial) / RankingInsights(표 아래 자동 해설) / RankBadge / SourceLine / Header / Mark
    CountryRegional.tsx 국가 상세의 국내 랭킹 칩 탭과 선택된 순위표(첫 순위만 초기 전달, 탭 선택 시 API 로딩)
    CountryWorldRankings.tsx 세계 순위 첫 48개만 초기 전달, 이후 페이지는 국가 API에서 조회하고 브라우저 메모리에 캐시
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
5. 수동 랭킹은 JSON을 직접 편집한다. 만들거나 수정한 AllRanks 어시스턴트가 검증 책임자다. `verified:true` 전에 링크된 원출처를 열어 모든 항목명·선정 근거·표시 순서·판/연도를 대조한다. 기사 표본이 특정 범위만 다루면 범위를 적고, 부문별 추천은 단일 점수 순위처럼 해석하지 않도록 한계를 기록한다. 출처로 확인하지 못한 항목은 추가하지 않고 `verified:false`를 유지하며 공개 목록과 직접 상세 경로에서 제외한다.

WIN 2026 Worldviews Survey의 국가별 반려동물 보유 응답률은 `pet-*-ownership.json` 6개 수동 랭킹으로 저장한다. 44,000건의 설문에서 응답자가 집에 해당 동물이 있다고 답한 비율이며, 국가별 표본 범위 차이와 영국 미포함을 출처 설명에 표시한다.

`imf-credit-outstanding.json`과 `imf-credit-gdp.json`은 Visual Capitalist의 2026년 10월 IMF 차입국 표에 실린 상위 26개국을 수동 스냅샷으로 보관한다. 값은 각각 미상환 IMF 신용의 USD 십억 단위와 2026년 GDP 대비 비율이며 소수 첫째 자리로 반올림되어 있다. 출처 표가 약 10억 달러 이상인 최대 차입국만 나열하므로 전체 차입국 순위로 해석하지 않는다.

Equilar CEO 보상은 `scripts/sources/equilar.mts`에서 공식 2026년판 표의 JSON API를 읽어 `us-highest-paid-ceos`로 저장한다. 정확히 100행·7열, 달러 정수·내림차순을 검증하며, CEO 이름·회사/티커·2025 회계연도 보상액을 보존한다. `scope: "US"`는 조사 대상 기업의 범위이고 CEO 국적이 아니다. `VIZ_OVERRIDES`에서 로그 축 점 분포를 지정해 CEO별 보상을 전체 범위에서 비교하고 각 점에 hover 정보를 제공한다. 아래 표의 비교 막대도 1천만 달러 기준 로그 축을 사용한다. 갱신 명령: `npm run data:update -- us-highest-paid-ceos`. 랭킹 표의 값 열은 `max-content`까지 늘어나 큰 달러 금액도 잘리지 않는다(모바일은 이름 열이 줄어듦).

재생에너지 비중(`renewable-energy`)은 OWID의 SDG 7.2.1 CSV와 World Bank API를 병렬 조회하고, 국가 10개 이상인 결과 중 가장 최신 연도의 자료를 저장한다(동일 연도면 OWID 우선). OWID 표기는 UNSD·IEA·IRENA 자료를 재배포하며, World Bank도 IEA 원자료 기반이므로 이중 경로는 제공·갱신 경로의 장애 대응에 쓰고 완전히 독립된 통계 생산원이라고 간주하지 않는다. 갱신 명령: `npm run data:update -- renewable-energy`.

`Pipeline.fallbacks`는 같은 지표의 독립 제공 경로를 등록하며 `update.mts`는 주 소스와 폴백을 병렬 조회해 파이프라인별 최소 기준연도 이상인 최신 자료를 채택한다. 기본 `minYear`는 2025다. 단, `scripts/regional/lib.mts`의 국가별 통계 파이프라인은 실제 연도를 표시하는 조건으로 2020년 이후 공개된 역사·지역 자료도 보존한다. 국가별 공통 보강 자료는 OpenAlex의 연구량·영향력 지표 네 가지, GeoNames의 도시 고도, OurAirports의 공항 고도·활주로 길이를 사용한다. OpenAlex와 공항 지표는 비교할 기관·공항이 5개 이상인 경우에만, 도시·공항 목록은 상위 50개까지만 저장한다. 모든 목록은 원자료의 출처·라이선스·측정 한계를 노출한다. World Bank 어댑터는 최소 지정연도부터 현재 연도까지 조회하고, 같은 해 국가 관측치가 최소 10개인 가장 최근 연도를 선택한다. 페이지에는 실제 기준연도를 표시한다. 세계은행 확장 카탈로그는 국가별 값이 모두 동일한 시계열을 제외하며, 이진 정책 지표는 1/0을 Yes/No로 표시한다. 모든 자동 랭킹의 저장 JSON은 소스 장애 중 쓸 수 있는 마지막 스냅샷이다. 모든 조회가 실패하면 최소 기준연도에 부합하는 스냅샷만 보존하고, 적합한 자료가 없으면 오래된 랭킹 JSON을 제거한다. 파이프라인 정의는 유지해 새 자료 공개 후 다시 생성한다. `renewable-energy`는 OWID와 World Bank 경로를 함께 조회하며, `renewable-electricity`는 Ember/OWID를 주 경로로 World Bank 지표를 폴백으로 등록한다. 같은 원자료를 재배포하는 경우 독립 통계 생산원으로 간주하지 않는다. `expanded-worldbank.mts`, `worldbank-500.mts`, `worldbank-1024.mts`에 등록한 확장 지표는 공식 API의 2025년 이후 국가별 관측치를 사용한다. `worldbank-2048.mts`에는 세계은행의 다른 공식 통계 카탈로그에서 고른 1,024개 추가 시계열을 등록한다. 값은 단일 기준연도에서 선택하며 각 JSON에 지표 페이지 링크, 기준연도, 갱신 시각을 저장한다. 현재 세계 1,702개와 국가 한정 1,616개로 총 3,318개 랭킹이다. 독립국 194개 중 178개국에 국내 랭킹이 있고, 73개국이 10개 이상을 제공한다.

`oddities.mts`는 FAO 식품 공급 4종(2023), WHO 맥주 순알코올(2022), UNEP 가정·소매 음식물 쓰레기 2종(2022), UN Comtrade 플라스틱 폐기물 수출입 2종(2024), UNOOSA 연간 우주 물체 발사(2025)를 등록한다. 각 랭킹은 해당 시점에 국가별 값이 있는 단일 연도만 저장하고, 서로 다른 국가 수와 관측 한계를 출처 메모에 밝힌다. OWID 어댑터는 파라미터형 차트의 선택 조건도 `source.url`에 보존한다. 우주 발사량은 공동 발사 중복 집계와 미등록 물체 때문에 세계 총량 비중으로 표시하지 않고 `map` 시각화 예외를 사용한다.

### 5.1 데이터 수집 에이전트

```
npm run agent -- run          (수동 전체 갱신+발굴; 일일 실행은 로컬 스킬)
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

화면 레이아웃은 `src/app/globals.css`의 공통 breakpoint 규칙으로 대응한다. 640px 이하에서는 헤더 메뉴를 가로 스크롤하고 검색·필터와 2열 요약 레이아웃을 세로로 전환하며, 380px 이하에서는 검색 버튼과 랭킹 행을 더 좁은 폭에 맞춘다. 시계열 및 편집 표는 데이터 열을 보존하면서 내부 가로 스크롤을 사용한다. 주요 터치 입력은 최소 40px 높이를 확보한다. Next.js App Router 기본 viewport 메타 태그(`width=device-width, initial-scale=1`)를 사용한다. 2026-10-23 프로덕션 배포 `dpl_HwheztTxuP7d1pXpocVPg5351EUD`의 운영 HTML/CSS에서 홈페이지 응답 및 모바일 breakpoint 규칙을 확인했다.

랭킹 상세 페이지 하단에는 `RankingContext` 서버 컴포넌트의 “About this ranking” 영역을 렌더링한다. 시각화·표·Highlights·출처 표시 다음에 배치한다. 기존 `Ranking` 데이터의 `source`(기본 URL과 중복 제거한 추가 참고 URL), `asOf`/`year`, `desc`, `unit`, `scope`·`items`, `order`를 사용해 출처·기준 시점·정의·단위·수록 범위·순위 방향을 보여준다. `updatedAt`은 기준 시점과 구분해 데이터 갱신일로 표시한다. 범위에는 수록 항목 수와 실제 값의 최솟값·최댓값, 세계 목록형 랭킹에는 서로 다른 국가 코드 수를 추가한다. 국가 한정 범위의 이름은 `countryInfo`로 조회하며 국적을 추정하지 않는다. 출처 메모와 방법론 링크를 함께 제공하고, 누락이 0을 의미하지 않으며 1위가 반드시 좋은 결과를 뜻하지 않음을 명시한다. 추가 클라이언트 JS와 스키마 변경 없이 서버에서 계산하고, 좁은 화면은 단일 열로 배치한다.

- 랭킹 상세 상단 시각화는 `RankingViz`가 `pickViz` 결과로 분기한다. 지도·버블맵의 도형만 SVG이고, 글자가 있는 트리맵·스트립·발산 막대·방사형 리더보드는 SVG 도형과 HTML 범례로 그려 모바일에서도 글자 크기가 유지된다. 시각화 본체는 서버 컴포넌트이고, 클라이언트 JS는 즉시 툴팁을 띄우는 `TipLayer`(`data-tip` 속성을 읽는 작은 클라이언트 컴포넌트)뿐이다. 이름 라벨 배치(겹침 회피)는 `src/lib/labels.ts`의 `placeLabels`가 맡는다. 색은 `--bar` 단일 색 + 중립 회색(음수만 `--neg`)이며, 대륙 구분은 행(facet)으로 한다. 예외는 `Regions` 누적 막대의 대륙 고정색 `--c1`~`--c5`(dataviz `validate_palette.js` 검증 팔레트)뿐이다. 버블맵은 `lib/map.ts`의 `projectPoint`와 `data.ts`의 `countryCoords`로 국가 좌표를 투영한다.
- 2026-10-19: 세계 랭킹(15개 이상)은 값 종류가 8개 이하이거나 최빈값이 전체의 30% 이상이면 지도(`map`)로 보낸다. 이산값·집중값이 스트립의 소수 위치에 겹쳐 대륙별 그래프가 불필요하게 세로로 커지는 문제를 줄이고, 지리적 분포를 드러낸다. 국가 내부 랭킹과 multi 목록에는 이 기준을 적용하지 않는다. 현재 기준으로 세계 랭킹 241개가 스트립에서 지도로 전환됐다.

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
- 분석: `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 `G-...` 형식으로 설정된 경우에만 `GoogleAnalytics` Client Component가 gtag.js를 `afterInteractive`로 로드한다. 초기 자동 page_view는 끄고 App Router의 pathname/query 변경마다 page_view를 한 번 보낸다. 운영 측정 ID `G-GG8DP7JS8C`를 Vercel Production에 설정해 배포했다. 환경변수 미설정·형식 오류 시 분석 스크립트는 로드되지 않으며, 값을 바꾸면 재빌드가 필요하다.

## 7. 확장 지점

랭킹 링크 복사(2026-10-19): 공용 클라이언트 컴포넌트 `CopyRankingLink`는 랭킹 ID·제목만 받아 `SITE_URL` 기준 절대 주소(`/ranking/<id>`)를 Clipboard API로 복사한다. 완료 시 아이콘을 체크로 바꾸고 2.5초 동안 상태 메시지를 표시하며, 실패·미지원 시 자동 선택된 읽기 전용 URL 입력창과 닫기 버튼을 제공한다. 접근 가능한 버튼 이름·라이브 상태·키보드 포커스를 제공한다. `RankingCard`, 국가의 세계 랭킹/발견/핵심 통계 카드, 검색 항목 카드, 국가 내부 랭킹 제목에 적용한다. 전체가 링크였던 카드는 `ranking-card-shell`로 감싸 링크와 복사 버튼을 형제로 두어 링크 안에 버튼이 중첩되지 않고 복사 클릭 시 이동하지 않는다. 카드 우측 상단에 버튼을 배치하고 라벨에 공간을 확보한다.

국가별 발견 기능(2026-10-19): `lib/discoveries.ts`의 `countryDiscoveries`가 전체 랭킹에서 편집 선정한 32개 지표만 평가한다. 국가별 단일 행, 30개국 이상, 최근 5년 이내 자료, 상위 20%라는 조건을 적용하며 국가 한정·목록형·국가 코드 중복·비유한 값·모든 값 동일·미검증 수동/AI 자료를 제외한다. 오름/내림차순을 적용한 동점 공동 순위를 계산하고, 상위 비율은 같은 값의 모든 국가를 포함해 올림하므로 대규모 동점을 상위 1%로 과장하지 않는다. 상대 위치→최신 기준 시점→ID 순서로 정렬한 뒤 카테고리당 하나, 최대 세 개를 고른다. 출처·기준 시점·단위·사람 검증 여부를 요약 모델에 보존한다.

`CountryDiscoveries` 서버 컴포넌트는 국가 페이지 상단 `#discoveries`에 카드와 선정 기준을 표시하며, 후보가 없으면 빈 상태와 전체 랭킹 탐색 안내를 제공한다. `DiscoveryShare`만 클라이언트 컴포넌트로 두어 Web Share API→클립보드 복사→수동 복사 입력창을 지원한다. `/country/[code]/discoveries/share` Route Handler는 동일 선정 함수로 `next/og`의 `ImageResponse`를 사용해 1200×630 PNG를 요청 시 생성한다. `?download=1`은 첨부 다운로드 헤더를 추가한다. 이미지 응답은 브라우저 1시간·공유 캐시 1일이며, 없는 국가나 발견 항목이 없으면 404다. 국가 메타데이터의 OG/Twitter 이미지도 이 경로를 사용한다. 그림에 비교 수·단위·기준 시점·출처·검증 상태·국가 URL과 종합 점수가 아니라는 안내를 포함한다. 랭킹 원본 전체를 새 클라이언트 컴포넌트에 전달하지 않는다.

홈 및 검색 결과 페이지가 공유하는 `SearchForm`은 입력 상태를 가진 Client Component다. 2글자부터 70ms 디바운스 API 요청으로 국가 최대 4개와 관련 랭킹 최대 6개를 검색창 아래에 표시한다. 입력 중에는 페이지를 이동하지 않으며 Enter/Search 또는 전체 결과 링크를 통해 `/search?q=…`로 이동한다. 미리보기는 국가명·랭킹 제목·소속 국가·항목 이름·분류·ID를 공통 검색 규칙으로 검색하고, 일치한 항목/국가와 분류를 함께 표시한다. 서버는 정규화된 검색 필드를 메모리에 한 번 색인하고, 클라이언트는 최근 검색 응답을 재사용한다. 이전 요청은 AbortController로 취소하고 검색어가 다른 응답은 표시하지 않는다. 포커스를 벗어나거나 Escape를 누르면 미리보기를 닫고 재포커스 시 다시 연다.

홈 소개 문구는 `src/app/page.tsx`의 제목 “No country tops everything.”와 설명 “From universities to GDP, fuel to Big Macs — discover where each country stands.”로 구성한다.
홈 상단 배지는 `allRankings()` 전체 개수를 표시하고, 최신·인기 카드 입력은 `scope`가 없는 세계 랭킹만 사용한다. 따라서 전체 랭킹 수에는 국가 내 지역 랭킹도 포함된다.

헤더 오른쪽에는 돋보기 버튼을 제공하며, 누르면 기존 `SearchForm`이 작은 패널로 열린다. 홈 지구본 아래, Popular rankings 위, 검색 결과 페이지에는 통합 검색 폼을 제공한다. 검색 결과 페이지는 `searchCountries`, `searchRankings`, `searchEntries`로
국가·랭킹·항목을 구분한다. 국가명·ISO-2 코드로 관련 랭킹도 찾으며 항목 상세 설명을 검색 대상에 포함한다. 전체 검색도 정규화 필드·항목 순위·국가별 랭킹 개수를 서버 메모리에 색인해 재사용한다. 국가 상세 집계(`countrySummaries`)를 검색 요청에서 호출하지 않는다. 개발에서는 5초 후 색인을 다시 만들어 JSON 변경을 반영하고, 프로덕션에서는 프로세스 수명 동안 재사용한다.
문자열은 NFKC 정규화 후 대소문자 구분 없이 비교한다. 국가명은 2글자 접두 검색(예: `ko`→South Korea)을 유지한다. 랭킹·항목 단일 검색어는 완전 단어 및 일반 복수형(`gun`/`guns`)을 허용하고, 일반 단어는 4글자 이상일 때 시작 부분 일치를 허용한다. 하이픈으로 연결한 이름은 3글자 이상 검색어에 한해 시작 부분 일치를 허용한다. 따라서 `gun`은 `Gunsan`, `Gunjur`, `Jinan-gun`에는 잘못 일치하지 않는다. 랭킹 검색은 ID·단위·출처명·출처 설명도 대상으로 하므로 `pet`이나 `cat`으로 반려동물 랭킹을 찾을 수 있다. 자동완성 색인은 랭킹 배열이 바뀌면 재작성한다. 항목 순위는 전체 랭킹에서 계산하며 표시 한도는 100개다. 랭킹 카드는 `page` 쿼리로 48개씩 표시하고 전체 개수·현재 범위·이전/다음 링크를 제공한다.
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

GitHub Actions `data-agent.yml`과 `container-ports.yml`은 `workflow_dispatch` 수동 실행만 제공한다. 일일 데이터 갱신·랭킹 발굴·원출처 검증·검사·Vercel 배포는 로컬 `allranks-daily-local-deploy` 스킬이 담당하며, `world.allranks.daily-local-deploy` LaunchAgent가 매일 자정 실행한다. 활성 로그인 세션과 깨끗한 production 작업 트리가 필요하다. 실행 로그는 `~/Library/Logs/allranks-daily-local-deploy.log`에 기록한다.

### 2026-10-18 홈 히어로 디자인

홈 서버 컴포넌트의 제목을 두 줄로 구성하고 `everything`에 테마 강조색을 적용한다. `home-hero` 전용 CSS로 반응형 타이포그래피, 통계 라벨, 지구본으로 이어지는 장식선을 제공하며 추가 클라이언트 코드나 이미지 의존성은 없다. 장식은 접근성 트리에서 제외하고 섹션은 제목과 연결한다.

2026-10-19: 홈 히어로를 포함한 변경을 `main` 커밋 `e4dcd87`로 푸시했으며, Vercel 자동 프로덕션 배포 `dpl_B4w68EWcavcGaibrR1xcftqsUWCx`가 Ready가 된 후 `allranks.world`의 HTML 응답에서 새 제목·안내 문구를 확인했다.

## 2026-10-19 Vercel Deployment Storage 조사

- `generateStaticParams()`는 랭킹 전체 3,316개와 국가 236개를 사전 생성한다. 기존 로컬 최신 `.next/server/app`의 파일 논리 크기 합은 약 1.34GB이며 HTML 515.54MB, RSC 805.54MB가 대부분이다(디스크 할당 크기와 구별). 랭킹 경로 약 1,000.16MB, 국가 경로 약 309.13MB. 각 페이지는 HTML뿐 아니라 `.rsc` 및 `.segments` 파일을 만든다.
- `RankingMap`은 공통 지도 SVG 경로를 각 해당 페이지에 인라인 렌더링한다. 랭킹 HTML의 SVG `d` 속성 합계는 약 67.39MB이며 RSC에도 렌더링 내용이 기록된다. `mapShapes()`의 프로세스 메모이제이션은 산출물 간 공유 저장을 의미하지 않는다.
- 국가 화면은 `CountryWorldRankings`에 모든 세계 순위 요약을 전달하고 `CountryRegional`에 국내 랭킹을 전달한다. 클라이언트 페이지 분할만으로 초기 직렬화 데이터가 줄어들지는 않는다.
- Vercel API 조회: 보관된 READY 배포 5개, 모두 production 대상(UTC 10월 19일 4개, 17일 1개). 최신 배포 커밋 `9c2c0f91`. 과거 로컬 `.vercel/output`은 10월 16일 자료로 최신 배포 크기의 증거로 사용하지 않는다.
- Deployment Storage는 보관된 빌드 출력, Functions Storage는 리전별 함수 번들을 별도 집계한다. 로컬 `.next`에는 배포되지 않는 캐시 등이 있으므로 총 디렉터리 크기를 청구량으로 해석하지 않는다. 실제 Usage/청구량·중복 제거·압축 효과·실효 보존 정책은 이번 API 응답으로 확인하지 못했다.
- 공식 자료: https://vercel.com/docs/deployment-storage 및 https://vercel.com/docs/deployment-retention . 개선 후보는 배포 보존 기간 조정, 공통 지도 자산 공유, 국가 데이터 지연 로딩, 일부 경로 요청 시 생성이다. 아직 구현하거나 운영 설정을 변경하지 않았다.

## 2026-10-19 배포 저장 공간 최적화 구현 (앞선 조사 후속)

- 공통 도형: 정적으로 생성하는 `/maps/world.svg`에 176개 지도 도형을 한 번 저장한다. `RankingMap`·`Bubbles`는 외부 SVG `<use>`로 도형을 참조하고 페이지별 색상·링크·툴팁·라벨을 유지한다. `mapAssetUrl()`의 도형 해시 쿼리로 브라우저 캐시를 구분한다.
- 국가 페이지: `generateStaticParams()`는 빈 배열, `dynamicParams = true`로 첫 요청에 생성·캐시한다. 세계 순위 첫 48개와 전체 건수, 국내 탭 메타데이터와 교육 우선 첫 순위 하나만 직렬화한다. `/api/country/[code]/rankings?page=N`은 48개씩, `?ranking=ID`는 해당 국가 scope의 국내 순위 하나를 제공한다. 국가·페이지·scope를 검사하고 CDN에 24시간 캐시한다. 클라이언트는 방문한 페이지·탭을 메모리에 보관하고 로딩·실패·재시도를 제공한다.
- 랭킹 페이지: 홈 최신/인기 선정 31개만 사전 생성하고 나머지는 첫 요청에 생성·캐시한다. 데이터 JSON은 함수 추적에 포함됨(랭킹 및 국가 API 모두 3,316개 확인). 주요 목록의 랭킹 링크 자동 prefetch를 꺼 실제 선택 전에 페이지가 생성되지 않도록 한다. 사이트맵은 전체 경로를 계속 제공한다.
- 운영 정리: 최신 production `dpl_2hQBnumHuQHH4CWT7dy7D72cVQhb`를 보존하고 이전 배포 4개를 API로 삭제했다. 프로젝트 기본 정책은 30일·최근 10개 보존이며 변경하지 않았다. `scripts/prune-deployments.mts`는 프로젝트·팀을 고정하고 정상 현재 production과 진행 중/더 새 배포를 보호하면서 교체된 완료 배포를 정리한다. 기본 dry run, `--apply`에서만 삭제하며 매 삭제 직전 현재 production을 재확인한다.
- `.github/workflows/prune-deployments.yml`은 배포 성공 이벤트·매시간·수동 실행을 지원한다. 기본 브랜치 반영과 GitHub Actions `VERCEL_TOKEN` 시크릿 설정 후 가동된다. API 토큰은 서버 앱이나 브라우저 코드에 넣지 않는다. 현재 코드 변경은 아직 커밋·푸시·배포하지 않았다.
- 로컬 빌드 검증: 페이지 출력 `.next/server/app` 논리 합계 약 1,339MB → 27.71MB(약 97.9% 감소, 요청 시 생성 전 측정), 정적 생성 53개. `npm run build` 통과(데이터 3,316개 오류 0, 기존 경고 2). 국가 KR 페이지 200, 세계 순위 API page 0/1 각 48개·전체 1,388개, 국내 scope 일치 200/타국 scope 404, 잘못된 페이지 400/404, 없는 국가·랭킹 404를 확인했다. 미리 만들지 않은 국내 랭킹은 MISS 다음 HIT로 캐시된다. 지도 엔드포인트 200·176개 도형 확인. Safari에서 공유 지도 도형·색상·범례와 국가 초기 화면을 확인했다. 탭/페이지 버튼 조작과 툴팁은 미검증.
- 제한: 첫 방문에 렌더링 지연/함수 실행이 생기고 방문한 페이지의 캐시는 이후 늘어난다. 97.9%는 초기 로컬 페이지 출력 감소이며 실제 Vercel 청구량·함수 저장 공간 감소율이 아니다. 삭제 직후 Usage 수치가 즉시 줄어드는지 확인하지 못했다.

### 프로덕션 반영 결과 (2026-10-19)

- 커밋 `aa32df3`을 `main`에 배포했다. 프로덕션 Vercel 배포 `dpl_BL5vG5ZZ7gwzZHm878e2AKTfU1ty` READY, `allranks.world` 홈·공유 지도 SVG·국가 페이지·지연 생성 랭킹·국가 API 모두 HTTP 200. 새 배포 후 이전 production `dpl_2hQBnumHuQHH4CWT7dy7D72cVQhb`을 삭제했고 API 목록에서 현재 production 하나만 남았음을 확인했다.
- Actions 자동 정리 workflow가 등록되어 deployment status 이벤트에서 실행됐으나 저장소 `VERCEL_TOKEN` 미설정으로 정리를 건너뛰었다. 이후 자동 정리는 시크릿 등록 후에만 활성화된다. Vercel 프로젝트의 기본 보존 정책(30일, 최근 배포 10개)은 변경하지 않았다. 최신 한 개만 남는 상태는 이번에 수동 API 정리로 적용했다.

### 검증 후 게시 정책 (2026-10-20)

`src/lib/data.ts`는 `verified:false`를 공개 데이터에서 제외한다. 수동·에이전트 자료는 명시적 `verified:true`만 허용한다. 동일한 필터를 생성 클라이언트 카탈로그에도 적용한다. 목록·검색·국가 집계·사이트맵은 공개 데이터만 사용하고 미검증 상세는 404가 된다. 원본 JSON은 비공개 초안으로 보존한다. 어시스턴트는 `/Users/eugene/.codex/skills/allranks-verify-publish/SKILL.md`를 매번 적용해 원문 대조 후 검증 주체·날짜·범위·한계를 기록한다. 기존 검증 대기 배지 표시는 이 정책으로 대체한다.


## 개발 도구 스킬 (2026-10-20)

개인 Codex 환경의 `~/.codex/skills/`에 `mattpocock/skills`의 스킬 38개(개발 중 7개 포함)를 설치했다. 설치 기준 커밋은 `5beb35b040e3de97e54fa9e386d7e42d15c295c2`이며 앱 런타임 의존성에는 포함하지 않는다.

### 검색 색인 설정 진단 (2026-10-21)

- 운영 `/robots.txt`는 `Disallow: /search`로 검색 URL 크롤링을 차단한다(`src/app/robots.ts`). `/search?q=india`는 HTTP 200이지만 HTML에 `robots=noindex`를 출력한다(`src/app/search/page.tsx`). 사이트맵도 검색 URL을 포함하지 않는다. 현행 의도된 제외 정책이며 이번 조사에서 앱 설정은 변경하지 않았다.

### 검색 페이지 색인 허용 (2026-10-21)

- 앞선 진단의 제외 정책을 변경했다. `src/app/robots.ts`의 `/search` 차단을 제거하고 검색 페이지 메타를 `index, follow`로 설정한다. 쿼리 문자열을 포함한 검색 결과도 크롤링 및 색인을 허용한다.

### SEO 지원 스킬 설치 (2026-10-21)

- `leopard627/fire-your-seo-agency`를 개인 Codex 경로 `~/.codex/skills/fire-your-seo-agency`에 설치했다. SEO·AEO·GEO·LLMO·NEO 진단 및 콘텐츠 운영용 도구이며 앱 런타임 의존성에는 포함하지 않는다.

### SEO 운영 진단 (2026-10-21)

- 운영 HTTP와 로컬 코드를 대조한 SEO 진단을 `seo_audit_2026-10-21.md`에 기록했다. 운영 검색 차단과 로컬 허용 설정의 차이, canonical/JSON-LD 부재, 초기 50개 행 제한, 사이트맵 lastmod 부재 및 /latest 누락을 확인했다. 설계·앱 코드는 변경하지 않았다.

### SEO 응답 구조 개선 (2026-10-21)

- `src/lib/seo.ts`의 공통 메타 생성기로 정상 페이지별 canonical·Open Graph·Twitter 메타를 생성한다. 국가/분류/검색은 쿼리와 유효 페이지 번호를 정규화하고 페이지별 canonical을 유지한다. 국가 페이지는 빈 generateStaticParams를 제거하여 요청 시 쿼리 기반으로 렌더링한다.
- `JsonLd`는 `<`를 이스케이프하여 전역 Organization/WebSite 및 상세 Dataset/BreadcrumbList를 HTML에 출력한다. 외부 원자료는 citation/isBasedOn이며 AllRanks는 집계 publisher다. `/share-image`는 1200×630 공통 공유 이미지를 제공하고 국가별 기존 이미지는 유지한다.
- `RankingTable`은 초기 50개 제한 없이 전체 행을 semantic table로 렌더링한다. 국가의 세계 랭킹 목록은 서버 컴포넌트로 전환하고 국가·분류를 48개 단위 링크 기반 페이지로 나눈다. 출처 설명은 웹사이트/라이선스로 묶고 지구본 상세 툴팁은 hover/focus/선택 시 렌더링하여 초기 HTML을 줄인다.
- `/sitemap.xml`에 `/latest` 및 랭킹 콘텐츠 스냅샷 lastmod를 추가한다. `scripts/seo-snapshots.mts`는 updatedAt을 제외한 해시 변경만 기록하고 최초 관측 시점을 기준선으로 삼는다. `data/seo-snapshots.json`은 버전 관리 대상이며 사전 빌드 때 갱신한다. `/llms.txt`는 선택 안내다.
- 소유 확인 메타는 Google/Bing/Naver 환경변수로 지원하며 계정 등록을 자동 가정하지 않는다. 실제 HTML 회귀 검사는 `scripts/seo-check.mts`, 스냅샷 날짜 보존 검사는 `scripts/seo-snapshots.test.mts`, CI는 `.github/workflows/seo.yml`에서 실행한다. 운영 측정 절차는 `seo_operations.md`에 기록한다.

### SEO 운영 반영 및 최종 검증 (2026-10-21)

- 운영 배포 완료: https://allranks.world (Vercel READY, `allranks-o2l7hcghh-eugene204-5519.vercel.app`). 운영 HTTP 검사 25개와 공유 PNG 확인 통과. 검색 index/follow 및 robots 허용, 표본 랭킹 135개 전체 행, 페이지별 canonical/JSON-LD, 사이트맵 3,577 URL 및 lastmod 3,326개 확인. 비공개 랭킹 9개 상세는 모두 404.
- 최종 검증 기록: `reports/seo-verification-2026-10-21.json`. 신규 SEO CI 파일은 로컬에 추가했으며 GitHub에서 실행하려면 커밋·푸시가 필요하다. 이번 작업은 Vercel 직접 배포이며 Git 커밋·푸시는 하지 않았다.
- 남은 외부 확인: Search Console/Bing/네이버 계정 등록·사이트맵 제출·성과 지표와 AI 실제 인용은 연결된 계정 없이 미확인. PageSpeed 공개 API는 HTTP 429(쿼터 초과)로 측정 불가했으므로 Core Web Vitals 개선을 주장하지 않는다. 첫 재측정 권장일 2026-11-04.

### 공통 푸터 FAQ (2026-10-21)

- 전역 RootLayout 푸터에 서버 컴포넌트 `src/components/FooterFaq.tsx`를 추가했다. 네이티브 details/summary로 질문·답변 7개를 렌더링하여 JavaScript 없이 읽고 펼칠 수 있다. 데스크톱은 소개/질문 2열, 640px 이하에서는 1열이며 기존 디자인 변수와 키보드 포커스 표시를 사용한다. 연락처는 기존 CONTACT_EMAIL 설정을 공유한다.
- 검증·배포 완료: 프로덕션 빌드 통과, Safari 접기/펼치기 확인, 운영 홈·소개·랭킹 페이지 HTML에서 공통 FAQ 7개와 답변 확인. https://allranks.world 에 반영했다.

### RSS 피드 (2026-10-21)

- `src/app/feed.xml/route.ts`가 공개 allRankings() 및 콘텐츠 스냅샷 매니페스트를 사용해 정적 RSS 2.0을 제공한다. 최대 50개를 관측 변경일 내림차순·ID 오름차순으로 정렬하고, 콘텐츠 해시 기반 GUID·UTC pubDate·atom self 링크를 출력한다. XML 특수문자를 이스케이프하고 피드 MIME 및 nosniff 헤더를 설정한다. RootLayout 및 pageMetadata에 RSS 자동 발견 링크를 넣고 llms.txt에서 안내한다. RSS 피드 사용은 사람용 UI에서 홍보하지 않는다.
- 운영 반영 완료: `allranks-1xcopicp2-eugene204-5519.vercel.app` → https://allranks.world/feed.xml. 실제 응답의 application/rss+xml, XML 파싱, 50개 항목·고유 GUID·스냅샷 날짜, 비공개 9개 제외, 홈/랭킹/국가 3개 경로의 자동 발견 링크를 확인했다. 기존 공개 랭킹만 재사용하며 원자료 값·검증 상태는 변경하지 않았다. 후속 RSS 갱신 점검 권장일 2026-11-04.

### RSS 검색엔진 제출 (2026-10-21)

- Google Search Console의 `sc-domain:allranks.world` 속성에 https://allranks.world/feed.xml 을 제출했다. 화면에서 RSS 형식, 제출/최근 읽기 2026-10-21, Success, 발견 URL 51개 및 제출 성공 메시지를 확인했다. 이는 색인·AI 인용 완료를 의미하지 않는다.
- Bing Webmaster Tools에는 사이트를 추가했고, 발급받은 공개 소유 확인 값을 Vercel Production의 `NEXT_PUBLIC_BING_SITE_VERIFICATION`에 설정했다. 기존 메타 생성 코드를 이용한 운영 배포와 소유 확인을 완료했다.
- Bing 소유 확인 성공: 운영 HTML의 msvalidate.01 태그를 직접 확인한 후 Webmaster Tools의 “Site addition successful” 및 도메인 추가 성공 메시지를 확인했다. RSS 제출을 이어서 완료했다.
- 최종 결과: Bing Sitemaps에 https://allranks.world/feed.xml 을 제출했고 “successfully submitted for processing” 메시지 및 목록의 Processing 상태를 확인했다. Google은 Success, Bing은 접수 후 처리 중이며 실제 색인·인용 완료와 구분한다. Bing 확인 태그 환경변수는 소유 확인 유지를 위해 보존한다. 2026-10-22 이후 Bing 처리 상태를 재확인하고 2026-11-04에 기존 성과 재측정을 진행하는 것이 후속 계획이다.

### SEO 운영 재점검 (2026-10-21)

- 운영 HTTP를 다시 읽고 HTML/XML을 파싱했다. 루트, 유효 랭킹, 국가/분류 및 2쪽 페이지는 SSR 200이며 canonical이 있고, 랭킹 Dataset과 경로 BreadcrumbList JSON-LD가 유효 JSON이었다. robots 공개 허용, RSS 자동 발견, `application/rss+xml`, 50항목 RSS, `llms.txt`, 3,577 URL 사이트맵을 확인했다. sitemap은 3,326개의 lastmod를 가지며 최신은 2026-10-20T19:27:22Z다. 임의 404는 404로 응답하고 검색은 기존 정책대로 index/follow다.
- 표본 메타 길이와 FAQPage 부재, 네이버·AI 인용·검색 지표 미확인 사항 및 권고는 `seo_audit_2026-10-21.md` 재점검 절에 기록했다. 이번 점검에서 앱 코드는 변경하지 않았다.

### FAQPage JSON-LD (2026-10-21)

- `src/components/FooterFaq.tsx` now defines the seven FAQ questions and answer fragments once, rendering them both as visible footer content and a Schema.org `FAQPage`. Link labels and dynamic contact email are incorporated into the same answer parts; JSON-LD `Answer.text` is the exact visible text content. `JsonLd` escapes `<` before serializing, consistent with the bundled Next.js JSON-LD guide.
- TypeScript and production build passed. Deployment `allranks-q91apam3x-eugene204-5519.vercel.app` is READY and aliased to https://allranks.world. Production HTML on home and About contains valid FAQPage JSON-LD; parsed question/answer text matched visible FAQ content 7/7.

### RSS 푸터 링크 제거 (2026-10-21)

- 사용자 결정에 따라 푸터의 RSS feed 앵커를 제거했다. `rel="alternate"` 자동 발견 메타데이터, `/feed.xml` 응답 및 검색엔진 제출은 유지한다. 타입 검사와 프로덕션 빌드 통과 후 READY 배포 `allranks-lry4q45w4-eugene204-5519.vercel.app` → https://allranks.world. 운영 홈에서 자동 발견 링크는 있고 푸터에 `/feed.xml` 링크는 없으며 피드는 200 `application/rss+xml`로 확인했다.

### 2026 global banks asset ranking (2026-10-21)

- Added `data/rankings/world-largest-banks-by-assets-2026.json` with 30 banks, source-published order, country labels and total assets rounded to USD trillions. The reference year is FY2025 and edition year is 2026. A new `entityType: "bank"` distinguishes a global list of institutions from country-level rankings, keeps entries out of country aggregation, and preserves flags and bank-specific source text in ranking views.
- Directly opened and parsed the full Visual Capitalist table; checked all names, order, countries and values. Its article attributes the ranking to S&P Global Market Intelligence's April 2026 list. S&P's public topic summary conflicts on ICBC/top-four totals; that limitation is exposed in the ranking source note. The record faithfully transcribes Visual Capitalist and does not claim the discrepancy was resolved.

### Natural gas price comparison (2026-10-21)

- Added `data/rankings/natural-gas-prices-2026.json`, transcribing the article's four Jan–Sep 2026 benchmarks. Direct access to Visual Capitalist returned HTTP 403, so the complete attributed syndicated copy and its graphic were opened at egov.mn. The source record links that reprint, IMF/FRED historical series and independent US benchmark references. It is verified as a faithful source transcription and public, with explicit sponsored-source and benchmark-method differences in the description and source note. No app or schema change was made.
- Production validation: Vercel deployment `dpl_7CiEQKtoxAr3HvhYdwJQC6mLWssG` is READY at https://allranks.world. Opened `/ranking/natural-gas-prices-2026` in production and confirmed all four labels/values and the sponsorship/methodology caveat in SSR HTML; confirmed its canonical ranking URL is in the production sitemap.

2026-10-21 Everyday Essentials 확장: 카테고리 공개 검증 랭킹을 18개로 확대했다. TechRadar 모델별 전동칫솔 6개와 공기청정기 9개, Good Housekeeping 시험 추천인 식기세척기 5개·매트리스 8개·극세사 천 5개·베개 5개·재사용 키친 타월 5개를 원문 표기와 부문상 맥락에 맞춰 추가·수정했다. 부문별 추천은 통합 성능점수로 해석하지 않도록 설명을 붙였다. 출처가 불충분한 브랜드 쇼트리스트 5개는 검증 대기 상태로 비공개 유지한다.

2026-10-21 검증 보완: Everyday Essentials의 면도기·진공청소기·세탁/건조기 브랜드 신뢰도·헬멧 항목을 원자료에 맞춰 재구성해 공개 검증했다. 면도기는 GH 남성 전동면도기 4개 추천, 진공청소기는 TechRadar 모델 7개, 세탁/건조기는 CR 라이선스 리프린트의 17개 통합 브랜드 순위, 헬멧은 SHARP에서 5성 받은 Shark 모델 7개다. CR 주방가전 전체 신뢰도 순위 5개도 별도 추가했다. 냉장고 단일 브랜드 5개 목록은 출처가 순서·점수를 뒷받침하지 않아 비공개 초안으로 남겼다.

2026-10-21 미국 연도별 베스트셀러 앨범: Visual Capitalist의 2000–2025년 미국 연간 1위 앨범 26개를 `us-best-selling-albums-by-year.json`에 수동 등록했다. 세계 엔터티 상품 목록으로 처리하고 연도순으로 표시하며, 원문 판매량은 보조 설명에 보존했다. 판매량은 시대별 집계 방식이 달라 직접 비교하지 않는다는 설명을 상세 데이터에 포함한다. 원문 URL은 직접 요청 시 403이었으나 검색 인덱스의 전체 본문과 표에서 아티스트·앨범·연도·판매량을 대조해 검증 완료했다.

2026-10-21 엔터테인먼트 분야 확장: `entertainment` 카테고리를 추가하고 기존 미국 연도별 베스트셀러 앨범 자료를 이 카테고리로 이동했다. Spotify 최다 스트리밍 앨범·곡, 역대 판매 비디오게임·콘솔, 세계 최고 흥행 영화·감독 등 검증된 전역 엔터티 목록 6개를 추가했다. 스트리밍·판매·박스오피스 금액의 기준시점과 원문 비교 한계를 각 데이터 설명에 기록한다.

2026-10-21 엔터테인먼트 데이터 출처 다변화: Visual Capitalist 기반 목록 외에 Netflix Tudum 공식 글로벌 시청 목록(영어/비영어 TV·영화), Billboard Japan 2025 연간 차트(Hot 100·Hot Albums·Streaming Songs·Top Singles Sales), Oricon 주간 만화 단행본 판매, SteamDB 동시 접속 최고 기록을 수동 검증 데이터로 추가했다. 서로 다른 기간과 지표는 각 랭킹의 설명·단위·기준일에 분리해 기록하며, Billboard는 공개된 차트 순위만 저장하고 공개되지 않은 점수를 추정하지 않는다. Netflix는 공개된 첫 91일 조회수 기준이며, SteamDB는 Steam 내 역대 동시 접속자 최고치로 한정한다.

2026-10-21 교육 기관 엔터티: `entityType: "institution"`을 추가해 국가별 집계·지도·국기 표기에서 제외되는 글로벌 대학·교육기관 목록을 표현한다. Visual Capitalist가 NCES 자료로 제시한 2022년 아이비리그 입학률과 SAT 중간 점수·재정보조 후 평균 비용을 별도 속성/설명으로 등록했다.

### Best universities outside the U.S. (2026-10-21)

- Added `data/rankings/best-universities-outside-us-2027.json` with all 101 institutions and THE overall scores from Visual Capitalist's 2027 list. `year` and `editionYear` are 2027, so this ranking is eligible for `/latest`.
- Visual Capitalist direct access returned HTTP 403. Verified the complete table in a syndicated copy and cross-checked the edition and score/rank context against the official THE World University Rankings page. Tied scores are preserved; the description explains that this is the global list with U.S. institutions removed.
- Updated `allLatestRankings()` to include a verified next-edition-year ranking published in the current calendar year, while retaining current-year candidates. This makes the 2027 edition visible in 2026 `/latest` and home LATEST.
- Validation: `npm run data:validate` (3,362 files, 0 errors), `npm run lint`, `npm run build`, and `git diff --check` passed. Vercel production deployment `dpl_7EqygT7SEsSWGkfPFUPkawDGYMUi` is READY at https://allranks.world. Authenticated production requests confirmed the ranking page and `/latest` contain the new title and table entries.

### UK renewable electricity rankings (2026-10-22)

- Added 10 verified GB-scoped rankings from the Department for Energy Security and Net Zero's “Renewable electricity by local authority, 2014 to 2025” workbook: total renewable generation; onshore wind, offshore wind, solar PV, hydro, landfill gas, sewage gas, anaerobic digestion and plant biomass generation; and total renewable installed capacity.
- The records preserve the 2025 observation year and MWh/MW units. Local-authority rows are used; aggregate rows are excluded. Suppressed `[X]` cells are not imputed, and descriptions/source notes state that lists may omit authorities whose values were suppressed.
- The AllRanks assistant checked both original workbook tabs used, all included authority names, metric columns, values, units and descending order. Each record links the official statistics page and states OGL v3.0, the verification date and the suppression limitation.

### U.S. state electricity generation rankings (2026-10-22)

- Added 10 verified `US`-scoped rankings from EIA final annual 2025 state data: total, natural gas, coal, nuclear, wind, solar, conventional hydroelectric, petroleum, other biomass and geothermal net electricity generation.
- The original workbook's “Total Electric Power Industry” rows are used, with state/DC abbreviations retained as item details and the national aggregate excluded. Values are MWh; EIA's combined solar category and “Other Biomass” category are described explicitly. Longer lists show the top 25 reported positive values; short lists show all positive reported values.
- The AllRanks assistant checked the original workbook's included state names, source categories, values, units, year and descending order. The records cite EIA's official historical data page and EIA's public-domain reuse policy.

### 인도·파키스탄 국내 센서스 랭킹 확장 (2026-10-22)

- 인도 Census 2011 Primary Census Abstract 공식 엑셀에서 주·연방 직할지의 총계 행 35개를 추려 인구·가구·여성 인구·SC/ST 인구·문해 인구·근로자·0–6세 인구 등 14개 랭킹을 수동 등록했다. 파생 지표(성비, 도시 인구 비중, 문해율, 여성 문해율, 가구당 인구, 근로자 비율)는 원자료 열에서 산출식을 명시해 계산한다.
- 파키스탄 PBS Census 2023 Table 1의 5개 행정 단위에서 인구·면적·성비·인구밀도·도시 비중·평균 가구원 수·2017–23 연평균 인구 증가율 7개 랭킹을 등록했다. 표가 다루지 않는 AJK·Gilgit-Baltistan 값은 보충하지 않았다.
- 원자료의 지역 행·지표 열·값·연도·정렬을 AllRanks 어시스턴트가 직접 대조하고 모든 신규 자료를 `verified:true`로 기록했다. 센서스 경계와 연도 한계를 각 설명 및 출처 메모에 둔다.


## 2026-10-23 완료: 미국 산업별 고용 변화

- `data/rankings/us-industry-job-change-2026.json`에 Visual Capitalist가 BLS 자료로 정리한 2025년 9월~2026년 9월 미국 산업별 12개월 순고용 변화 16개를 추가했다.
- `entityType: "sector"`로 국가 목록·지도·국가별 집계에서 분리하고, 순고용 변화는 양·음 방향 막대로 표시한다. 정수 고용 변화로 내림차순 정렬하고 변화율을 보조 정보로 표시한다. BLS 공식 CES 차트와 대조했으며 잠정·계절조정 수치와 개정 가능성, 순고용 변화와 총 채용·이직 간 차이를 설명한다.


## 2026-10-23 AdSense 콘텐츠 품질 조사

공개 사이트와 저장소를 대조한 원인 조사를 `docs/adsense-content-audit-2026-10-23.md`에 기록했다. 공개 대상 3,401개 중 네 주요 출처 기반 자료가 2,978개이며 공통 해설 템플릿·세계 순위의 표본 범위·편집 책임/운영 문구를 개선 후보로 식별했다. Google 내부 거절 원인은 확정할 수 없다. 후속 작업은 핵심 페이지의 주제별 분석, 비교 범위 명시, 반복 페이지 통합/광고 노출 선별, 실제 운영과 방법론 문서의 일치다. 이번 작업은 조사·문서화 완료이며 제품 코드·랭킹 데이터·배포 변경은 없다.

## 2026-10-23 콘텐츠 해설·동일 스냅샷 비교 구조

`src/lib/reading-guides.ts`에 출처와 검토일이 있는 해설 9편을 정의하고 `/guides`, `/guides/[id]`에서 서버 렌더링한다. 원본 랭킹 JSON과 편집 해설을 분리한다. `RankingReading`은 주요 주제 및 OpenAlex·OurAirports·GeoNames·생활용품 목록에 해설을 연결하고 국내 동일 출처 자료를 묶는다. `EconomicComparison`은 동일 연도 GDP 두 표만 조인한다. `ranking-content.ts`는 포함 범위 설명·snapshot year·수치 비교 적격성을 정의하며, `RankingComparison`은 같은 데이터의 두 저장값 차이만 계산한다. 원본 값·verified 상태와 공개 필터는 유지한다. 인터넷 이용률은 로더의 표시 제목만 중립적으로 바꾼다.

공통 FAQ는 홈에만 렌더링한다. 전역 AdSense 스크립트는 제거하고 소유권 메타태그/ads.txt는 유지해 광고 요청과 계정 식별을 구분한다. `/editorial-policy`와 수정된 Privacy/Methodology가 실제 동작을 설명한다. 신규 해설은 사이트맵·헤더·홈·푸터로 연결한다. 상세 구현·검증·제약은 `docs/adsense-content-improvements-2026-10-23.md`에 기록했다.

## 2026-10-23 전체 랭킹 해설 계층

공개 3,401개 전체에 `buildRankingArticle` 본문을 서버에서 제공한다. `editorial-profiles.ts`의 59개 측정 유형과 `metric-reading.ts`의 지표 조건 설명을 실제 스냅샷 값/단위/정의/메모에 결합한다. `RankingReading`이 선택적 가이드 요약에서 모든 상세의 전체 본문으로 확장되었고, 중복 Highlights 렌더링은 제거했다. 해설은 정의·관측 결과·활용·작성 근거·한계와 출처로 구성되며 전문 심사나 독립 실사로 표시하지 않는다.

`data/editorial/worldbank-definitions.json`은 공식 API에서 받은 공개 지표 1,627개의 메타데이터, `source-access.json`은 나머지 고유 원출처 311개에 대한 접근 관찰, `coverage.json`은 공개 전체 본문 무결성 보고서다. 서버 전용 `editorial-data.ts`가 이 자료를 로드한다. `editorial:refresh`, `editorial:access`, `editorial:check`, `editorial:report`로 갱신/검사한다. 빌드 전 공개 지표 전체의 본문/출처/World Bank 정의 레코드 누락과 완전히 동일한 본문을 검사한다. 원자료 값과 verified 플래그는 바꾸지 않는다.

자국통화·예/아니오·p-value·순위/메타순위·제품 부문 추천·SHARP 등급에는 수치 차이 도구를 노출하지 않는다. 관련 읽기는 같은 국가/출처 또는 같은 주제의 적격 지표를 연결한다. 실제 구현과 한계는 `docs/full-ranking-editorial-rewrite-2026-10-23.md`를 참조한다.

전체 해설 검증: `editorial:check` 공개 3,401/3,401·59개 유형·오류 0, 타입 검사 및 production 빌드 성공, 데이터 검증 오류 0/기존 경고 3. 모든 유형을 포함하는 로컬 HTTP 72개 경로에서 본문/출처/제한 안내와 비공개 초안 차단을 확인했다. 실제 브라우저/모바일 검토 및 프로덕션 배포는 미실행이다.

## 2026-10-23 미검증 편집 초안 검증·공개

4개 초안을 원문 대조했다. 데이터센터 상위 25개는 Mappr 2025 표와 Straits 교차 자료를 대조하고 Stanford HAI의 미국 수치 5,427 대 Mappr 5,426 차이를 데이터 설명과 기록에 공개했다. PISA 수학은 40개 평균 점수 표를 대조했으며 OECD가 통계적 정확 순위를 보장하지 않는다고 안내하므로 제목·설명을 평균 점수 순서로 한정했다. QS 2027 상위 10개는 공식 QS 페이지의 동점 순위(2위·8위)를 데이터에 반영했다. 냉장고 목록은 Consumer Reports 2025 라이선스 원문에서 프렌치도어 점수 상위 5개(LG, GE/Haier 동점, Bosch, Whirlpool)로 재작성했다. 같은 수치에 공동 순위를 표시하도록 공통 순위 계산도 수정했다. 상세 대조표는 `docs/unverified-rankings-verification-2026-10-23.md`에 있다.

## 2026-10-23 프로덕션 배포

E-E-A-T 콘텐츠 개선과 검증된 수동 랭킹 4개를 Vercel deployment `dpl_4Yd3RFUJDb3z2SB9yLjUDrakBokq`에 배포했다. `allranks.world`가 해당 READY 배포를 가리킨다. 라이브 인증 우회 요청으로 랭킹 상세, sitemap, 검색 제안 API의 가용성을 확인했다.

## 2026-10-25 로컬 일일 수집·배포 스킬

사용자 스킬 `allranks-daily-local-deploy`를 추가했다. 로컬 AllRanks 저장소에서 자동 파이프라인 갱신과 에이전트 신규 랭킹 수집 후, 어시스턴트가 원출처를 직접 대조해 수동·에이전트 자료의 검증 책임을 수행한다. 검증된 변경만 검증·빌드 후 Vercel Production에 배포하며, 미검증 자료는 공개하지 않는다. 작업 트리 오염 시 중단하고 기존 변경을 건드리지 않는다. macOS LaunchAgent `world.allranks.daily-local-deploy`를 현지시간 00:00에 등록했다. 실행 로그는 `~/Library/Logs/allranks-daily-local-deploy.log`에 남는다. LaunchAgent는 사용자가 로그인한 세션에서 실행된다.

## 2026-10-28 daily collection — source blocker

No architecture, code, or ranking data changed. The clean automation checkout on main matched origin/main at eb86850835f08e780123bf1b240efe3410e32569; dependencies and authenticated Vercel CLI were available. The current Codex session ran agent:plan without invoking an external model.

## 2026-10-28 continued collection

Added a source-verified manual ranking for the top ten systems in TOP500's June 2026 list. Existing public filtering and data architecture are unchanged.

The build's editorial coverage gate also requires a source accessibility record for the new ranking; this requirement blocked the continued run before deployment.

The resumed run directly rechecked all ten TOP500 entries against the official June 2026 table and recorded the source HTTP 200 accessibility observation; the editorial gate can now assess the ranking. The WIPO candidate remains uncreated pending resolution of its source discrepancy.

## 2026-10-29 daily collection

The 20 October 2026 women’s 100m top-ten snapshot uses the existing verified manual ranking and source-access records; publication filters are unchanged.

- The June 2026 Green500 top-ten energy-efficiency snapshot is stored as a source-verified manual ranking alongside the TOP500 performance snapshot; its scope is eligible submitted systems and partitions.

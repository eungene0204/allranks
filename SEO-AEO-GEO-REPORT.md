# AllRanks SEO·AEO·GEO 통합 최적화

점검일은 2026년 11월 27일이다. 대상은 AllRanks 작업 폴더와 공개 사이트 `https://allranks.world`다. 운영 사이트는 변경 전 기준선으로 사용했고, 구현과 검증은 로컬에서 진행했다.

## 프로젝트 분석과 검색 의도

| 영역 | 확인한 구조 |
| --- | --- |
| 기술 스택과 배포 | Next.js App Router, React, TypeScript, Turbopack, Vercel. CSS는 시스템 서체를 사용하며 지도와 여러 시각화가 D3 및 world-atlas를 사용한다. 공개 응답에서 Vercel 캐시와 Brotli 압축을 확인했다. |
| 정적 페이지 | 홈, 최신·인기 목록, About·방법론·편집 정책·개인정보, 가이드·컬럼 목록, 두 RSS, robots와 사이트맵은 빌드 시 생성한다. 가이드·컬럼 상세와 일부 랭킹 상세도 SSG로 생성한다. |
| 요청 시 렌더링 | 국가·카테고리·검색은 쿼리를 해석해 서버에서 렌더링한다. 사전 생성되지 않은 랭킹 상세는 요청 시 HTML을 만든다. 히스토리·검색 제안·추가 상관관계는 API와 상호작용을 사용한다. 지도는 Canvas를 사용하고 순위와 핵심 요약은 HTML로도 제공한다. |
| 콘텐츠 | `data/rankings` JSON, 검증된 컬럼 JSON, 가이드 및 편집 프로필로 구성된다. 랭킹 공개 필터는 수동·AI 수집 자료의 검증을 요구한다. 로컬 공개 랭킹 3,430개와 편집 프로필 59개를 검증했다. |
| 언어와 지역 | 실제 콘텐츠는 영어이며 HTML은 `lang=en`이다. 국가 URL은 지역별 데이터 탐색용이다. 번역 페이지와 물리 사업장 정보는 확인되지 않아 hreflang과 LocalBusiness를 적용할 조건이 없다. |
| 분석과 광고 | 선택형 GA4 및 Google·Bing·네이버 소유 확인 메타가 기존 구성에 있다. 광고 스크립트는 정지 상태이며 ads.txt에는 공개 소유 확인용 설정이 있다. 배포된 GA4 속성의 이벤트 규칙과 동의 설정은 이번 검증 범위 밖이다. |

| 페이지 | 주요 검색 의도와 설계 |
| --- | --- |
| 홈, 최신·인기, 국가·카테고리 목록 | 탐색과 지역·주제별 비교. 홈과 카테고리 링크로 목록에 접근하고 국가 페이지에서 해당 국가가 포함된 표와 지역별 상세를 찾을 수 있다. |
| 랭킹 | 지표별 정보 탐색과 비교. 순위·연도·지리 범위가 제목과 도입부에 나타나고 실제 값과 기준은 표 및 출처에서 확인할 수 있다. 제품 목록은 상업적 조사에 도움을 줄 수 있으며 데이터의 비교 범위를 표기한다. |
| 가이드·컬럼 | 정보 탐색 및 해석. 직접 답변, 사례, 적용 범위와 원출처를 같은 페이지에서 제공한다. |
| About·편집 정책·방법론·개인정보 | 서비스 및 운영 정보 탐색. 문의와 정정 절차는 기존 공개 About·편집 정책에서 이어진다. 사이트 내부 검색의 결과는 색인에서 제외한다. |

## 발견 사항과 변경 전후

| 우선순위 | 변경 전 확인 및 영향 | 구현 결과 |
| --- | --- | --- |
| Critical | 공개 사이트 전체 차단이나 전역 `noindex`는 관측되지 않았다. | 공개 크롤링 정책을 유지하고 자동 검사에서 메타·헤더·robots를 점검한다. |
| High | 운영 `/country/ZZ`가 오류 화면과 HTTP 200을 함께 반환했다. `/country/IN?page=999999`는 마지막 페이지를 재사용했다. 새 클린 빌드는 기존 Next.js 16.4.3 취약점 경고에서 종료됐다. | 존재하지 않는 국가, 범위 밖·중복·잘못된 목록 페이지 번호는 404다. `page=1`과 유효 국가 코드의 대소문자 별칭은 정규 경로로 한 번에 308 이동한다. Next.js는 16.4.6에서 클린 빌드했다. |
| High | 카드용 약칭을 사용해 랭킹 1,599개가 39개의 중복 제목 그룹에 속했다. 국가별 공항 고도나 연구 지표에서 지역 구분이 빠졌다. | 검색 제목에 전체 지표명과 지역 범위, 기준 기간을 쓴다. 축약명은 카드에서 계속 사용한다. 같은 제목 생성기를 설명에 사용해 페이지 주제를 드러낸다. |
| High | 홈 국가 탐색은 지도 상호작용에 치우쳐 있었고 국가 내 목록의 비활성 탭은 버튼이었다. `/latest`는 홈 HTML에 직접 연결돼 있지 않았다. | 홈 국가 이름순 목록, 국가별 지역 랭킹 상세, 최신·인기 목록을 HTML 링크로 연결했다. 가이드·컬럼·카테고리 페이지 순회를 함께 검사한다. |
| High | Dataset의 수정일이 수집일과 같았고 일부 라이선스 값은 혼합 권리 설명이었다. 일부 Article 제목과 날짜가 화면의 실제 의미와 달랐다. | 라이선스 URL을 명확히 매핑할 수 있는 표에 Dataset을 적용했다. 랭킹 해설은 화면에 렌더되는 제목·설명·출처로 별도 Article을 만든다. 출처 수집일은 `time`, 가이드 검토일은 검토일, 컬럼 발행일은 발행일로 제공한다. |
| Medium | 홈 첫 로드에서 확대용 고해상도 지도와 홈 탐색용 RSC 응답이 내려왔다. 모바일 폼·대비·지도 링크 검사에 오류가 있었고, 랭킹의 연도별 추이가 초기 레이아웃을 이동시켰다. | 고해상도 지도는 확대 시 요청하고 자동 회전의 그리기 빈도를 줄였다. 홈 링크의 자체 prefetch를 중지했다. 검색 폼·대비·링크 이름·320px 가로 넘침을 수정했고, 연도별 추이는 순위표 뒤로 옮겨 상단에 바로가기 링크를 뒀다. |
| Medium | 지원 API는 일반 검색 결과 분류가 없었고 수동 GA4 페이지뷰에 내부 검색어가 포함됐다. | API에 `X-Robots-Tag: noindex`를 추가했다. 수동 GA4 이벤트의 주소와 검색 제목에서 내부 검색어를 빼고 유입 파라미터를 유지했다. 속성의 자동 이벤트 및 별도 유입 리퍼러에 적용하는 설정은 운영 계정에서 확인해야 한다. |
| Low | 홈페이지 FAQ의 구조화 데이터가 사용됐으며 가이드의 출처 확인일이 일괄 `lastmod`였다. | 보이는 FAQ는 유지하고 자주 묻는 질문의 검색 리치 결과가 종료된 Google 정책에 맞춰 FAQPage를 제거했다. 사이트맵은 가이드 검토일을 수정일로 보내지 않는다. [Google 정책 변경 이력](https://developers.google.com/search/updates) |

형식상 다른 페이지를 인위적으로 통합할 근거가 없어 기존 공개 슬러그를 유지했다. 국가별 범위가 다른 페이지와 페이지 2 이상은 각각 canonical을 가진다. 파라미터 없는 공개 문서를 사이트맵에 제공하고, 페이지 2 이상은 순차 HTML 링크로 발견한다. 키워드 유입 잠식과 검색어별 중복 의도는 노출·클릭 데이터로 확인해야 한다. 이번 검사는 HTML 메타와 경로의 중복, 내부 탐색 경로를 확인했다.

## 변경 파일과 목적

| 파일 | 목적 |
| --- | --- |
| `src/lib/seo.ts`, `src/lib/insights.ts` | 공통 canonical·로봇·사이트 식별자·페이지 검사 및 랭킹별 검색 문구 |
| `src/components/Breadcrumbs.tsx`, `src/app/layout.tsx`, `src/app/about/page.tsx` | 화면 탐색과 JSON-LD의 단일 데이터, 키보드 본문 이동, 사이트와 운영 주체 관계 |
| `src/app/page.tsx`, `src/app/category/[id]/page.tsx`, `src/app/country/[code]/page.tsx`, `src/app/country/[code]/loading.tsx` | 홈·국가 탐색 링크, 지역 실측 범위, 페이지 상태와 canonical, 스트리밍 전 경로 검증 |
| `src/app/ranking/[id]/page.tsx`, `src/app/ranking/[id]/loading.tsx`, `src/components/RankingReading.tsx`, `src/components/RankingCorrelations.tsx`, `src/components/SourceLine.tsx` | 고유 제목, 초기 HTML과 오류 상태, 표와 해설의 구조화 데이터, 시점과 출처 |
| `src/app/guides/[id]/page.tsx`, `src/app/columns/page.tsx`, `src/app/columns/[id]/page.tsx`, `src/components/FooterFaq.tsx` | 가이드·컬럼의 직접 답변과 편집 엔티티, FAQ 화면 유지 |
| `src/app/sitemap.ts`, `src/app/llms.txt/route.ts`, `data/seo-snapshots.json`, `data/editorial/source-access.json` | canonical 사이트맵, 선택형 도구용 탐색 안내, 확인할 수 있는 변경 시점 및 출처 접근 관측 |
| `src/components/GlobeExplorer.tsx`, `src/components/Header.tsx`, `src/components/SearchForm.tsx`, `src/app/globals.css`, `src/components/GoogleAnalytics.tsx` | 지도 초기 부하, 폼과 시각 대비, 가로 넘침, 키보드 이동, GA4 수동 이벤트의 검색어 제외 |
| `next.config.ts`, `package.json`, `package-lock.json`, `scripts/seo-check.mts`, `.github/workflows/seo.yml` | API 색인 헤더, Next.js 패치, 초기 응답 및 탐색 회귀 검사 |
| `AGENTS.md`, `software_architecture.md`, `srs.md`, `project_plan.md`, 이 보고서 | 검증 시 재발 방지, 현재 설계와 요구사항, 운영 이행 및 증빙 |

작업 시작 시 존재했던 별도 변경은 보존했다. WJP 공식 CSV에서 유럽 컬럼에 연결된 기존 Visual Capitalist 랭킹의 2026년 점수 41개와 내림차순을 대조했다. Visual Capitalist 원문은 이번 직접 요청에서 403을 반환해 해당 접근 기록만 추가했다. 기존 2021년 비교 수치와 검증 플래그는 그대로다. [WJP 2026 CSV](https://worldjusticeproject.org/rule-of-law-index/data/2026.csv) · [WJP 공식 발표](https://worldjusticeproject.org/news/wjp-rule-law-index-2026-global-press-release)

## AEO·GEO와 구조화 데이터

- 랭킹에는 지표·표본 범위를 포함한 한 문단 답변, 표, 원출처와 기준 기간이 있다. 표의 위치와 값, 지역별 포함 범위를 독립적으로 인용할 수 있다. 시계열은 원자료 API를 조회하고 본문 표는 빌드에 포함한 스냅샷을 사용한다.
- 가이드와 컬럼은 기존 질문과 답변, 출처 목록을 활용했다. AllRanks가 만든 해설과 비교 계산은 원자료 제공자의 수치와 구분한다. 비영리·공공 출처나 전문가의 검수 또는 제휴를 새로 주장하지 않는다.
- `Organization`과 `WebSite`는 공통 `@id`를 사용한다. About은 AboutPage, 주요 상세는 WebPage와 Article 또는 Dataset, 카테고리·국가·편집 상세는 BreadcrumbList를 제공한다. 가이드나 랭킹의 편집 날짜가 확인되지 않는 경우 Article에 임의의 발행·수정일을 붙이지 않는다.
- 파서를 통해 JSON-LD 구문을 확인하고, 관계·출처·표의 라이선스 표현를 실제 응답과 비교했다. Schema.org 타입·속성의 사용 적합성과 검색 제품의 리치 결과 자격은 별도 평가다. Article·Breadcrumb는 해당 검색 기능 가이드를, Dataset은 Dataset Search 가이드를 참조한다. `llms.txt`는 이미 제공하던 선택형 탐색 문서이며 정책·가이드·컬럼 RSS를 연결했다. 랭킹별 Markdown이나 데이터 복제는 출처별 라이선스와 재사용 가치가 확인되는 경우에 검토한다. [Schema.org Dataset](https://schema.org/Dataset) · [Google 구조화 데이터 가이드](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) · [Google Dataset 가이드](https://developers.google.com/search/docs/appearance/structured-data/dataset) · [Google AI 검색 가이드](https://developers.google.com/search/docs/appearance/ai-features)

## 크롤러와 운영 엣지

| 목적 | 공식 토큰 | 확인 상태 |
| --- | --- | --- |
| 공개 검색·검색 답변 | Googlebot, Bingbot, Yeti, OAI-SearchBot, Claude-SearchBot, PerplexityBot | 운영 robots의 전체 허용 규칙에 포함된다. 각 토큰을 User-Agent로 지정한 홈 요청에서 200이며 `X-Robots-Tag: noindex`가 없었다. |
| 사용자가 요청한 페이지 가져오기 | ChatGPT-User, Claude-User, Perplexity-User | 같은 홈 응답 검사에서 200이었다. 공급자별 robots 적용 방식은 공식 문서를 따른다. |
| 모델 학습 및 해당 제품의 데이터 사용 제어 | GPTBot, ClaudeBot, Google-Extended | 별도 제한을 설정하지 않은 기존 정책이다. Google-Extended는 robots용 제품 제어 토큰이고 개별 HTTP 요청 식별자가 아니다. Google Search AI 기능과 Gemini 등 제품의 학습·근거 제공 제어를 구분한다. |

운영 Vercel CLI의 라이브 설정은 Bot Protection Off, AI Bots Allow, BotID Basic, 사용자 정의 방화벽 규칙 없음이었다. HTTP와 www 변형은 각각 1회 이동 후 정규 HTTPS 홈 200이었다. 국가 2페이지 응답은 Brotli로 전송됐다. 최초 CDN MISS 후 반복 요청 두 건에서 HIT였고 브라우저용 응답은 private/no-store였다. 운영에서 확인한 사이트맵은 3,727개 URL이며 이번 로컬 3,696개와는 배포에 포함된 데이터 범위가 다르다. Vercel의 최근 24시간 Googlebot 집계에서 Allow 요청을 확인했다. AI 봇별 실방문·시간대별 403·429 비율·전체 CDN 적중률은 후속 지표다. 사용자 에이전트를 바꾼 HTTP 200은 외부 엔진의 실제 방문을 확인하는 방법과 구분한다. [Google 크롤러](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers) · [Google AI 데이터 제어](https://developers.google.com/search/docs/fundamentals/gen-ai-controls) · [Bing 웹마스터 가이드](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) · [네이버 검색로봇](https://searchadvisor.naver.com/guide/seo-basic-robots) · [OpenAI 크롤러](https://developers.openai.com/api/docs/bots) · [Anthropic 크롤러](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) · [Perplexity 크롤러](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) · [Vercel Bot Management](https://vercel.com/docs/bot-management)

## 자동 검증 결과

| 항목 | 결과와 범위 |
| --- | --- |
| 프로덕션 빌드와 타입 | Next.js 16.4.6 및 Node 24에서 `npm run build`, `npm run lint` 통과. 현재 프로젝트의 lint 스크립트는 TypeScript 점검이다. 운영 의존성의 `npm audit --omit=dev`에서 취약점 0건을 확인했다. 새 빌드 사전 검사는 랭킹·컬럼 데이터 오류와 경고 없이 완료됐다. |
| 단위 테스트 | `node --test scripts/seo-snapshots.test.mts` 1개 통과. 수집 시점만 바뀐 스냅샷의 lastmod가 고정되고 미공개 스냅샷이 제외되는지 검사한다. |
| HTTP와 사이트맵 | `SEO_CHECK_ALL=1 npm run seo:check`에서 사이트맵 3,696개 canonical URL을 각각 200, 초기 head 메타, 단일 H1 및 목록 안에서 고유한 제목·설명으로 확인했다. 목록 순회 기준 고립 URL은 0개다. 전체 모드는 4,046개 응답을 검사했고, 마지막 Open Graph 로케일 정규화 뒤에는 기본 350개 회귀 검사와 로케일 표본 5개를 다시 확인했다. 샘플 별칭 4개는 308 후 200이며 대상별 리디렉션 체인은 1단계였다. 대표 오류 8개가 404였다. |
| 내부 링크 | 홈에서 모든 국가 첫 페이지와 카테고리 끝 페이지까지 따라가 `a href`를 구했다. 가이드·컬럼·최신·인기 목록과 지역 랭킹 링크를 포함했다. 상세 차트에 있는 모든 외부 링크나 모든 국가 페이지의 전체 페이지네이션을 대상으로 한 별도 전수 링크 감사는 남아 있다. |
| XML과 구조화 데이터 | `xmllint`로 사이트맵과 두 RSS를 파싱했다. 대표 랭킹과 가이드·컬럼 전체에서 초기 HTML JSON-LD 구문, 핵심 엔티티 연결 및 canonical 관계를 검사했다. CI 회귀 검사에 색인 메타·검색·404·308·사이트맵·초기 순위표·산점도 제목을 추가했다. |
| 미공개 격리 | 별도 빌드에 `verified:false` 랭킹 1개를 넣어 상세 404, 사이트맵·RSS·검색 결과·검색 제안에서 상세 링크 누락을 확인했다. 실제 작업 폴더에는 테스트 레코드를 추가하지 않았다. |
| 모바일과 브라우저 | Playwright와 Chrome에서 320, 390, 1,440px의 8개 경로를 점검했다. 페이지 수준 가로 넘침 0건, 브라우저 예외 0건, JavaScript 없이 건너뛰기 링크·국가 링크·지역 랭킹·순위표 접근을 확인했다. 산점도의 SVG 제목을 한 문자열로 전달한 뒤 서버 툴팁 텍스트와 초기 렌더링 오류 재발 여부를 검사했다. 확대 전 고해상도 지도 청크 미요청, 확대 후 청크 200을 확인했다. |
| 크롤러와 운영 경계 | 운영 홈에서 사용자 에이전트 지정 응답을 확인했다. 로컬 프로덕션 서버에서는 11개 요청 토큰으로 robots, 사이트맵, 국가 및 랭킹 총 44개 요청을 확인했다. Vercel 라이브 방화벽 설정과 최근 Googlebot 허용 집계를 확인했다. |
| 미검증 | 실제 색인 결과, AI 답변 내 인용, GA4 관리자 설정과 유입 실적, 배포 후 Rich Results Test·Schema Markup Validator·URL Inspection, 모든 보조 차트의 WCAG 2.2 AA 준수 및 실사용 p75를 확인할 운영 데이터는 이번 결과에 포함되지 않는다. 공개 PSI API가 HTTP 429를 반환해 CrUX 데이터 존재 여부도 이 요청으로 판단할 수 없다. |

로컬에서 실제 응답을 재현하는 명령은 다음과 같다. 프로덕션 서버를 띄운 뒤 robots 응답이 준비된 것을 확인하고 실행한다.

```bash
npm run lint
node --test scripts/seo-snapshots.test.mts
npm run build
npm run start -- --port 3200
# 다른 터미널
curl -fsS http://localhost:3200/robots.txt
SEO_CHECK_ALL=1 npm run seo:check -- http://localhost:3200
```

## Lighthouse 실험실 성능

Lighthouse 13.6.0과 Chrome을 사용했다. 같은 머신의 로컬 프로덕션 서버에서 홈과 `/ranking/wbx-lp-lpi-trac-rk`의 모바일·데스크톱 프로필을 각각 측정했다. 다음 값은 실험실 기준선과 개선본의 측정값이다. 전송량은 Lighthouse가 기록한 네트워크 전송량이고 TBT는 브라우저 메인 스레드 차단 시간이다.

| 프로필과 경로 | 성능 / 접근성 / SEO | LCP | CLS | 전송량 |
| --- | --- | --- | --- | --- |
| 모바일 홈 | 66 / 91 / 92 → 91 / 100 / 100 | 1.21초 → 1.21초 | 0 → 0 | 672 → 374 KB |
| 모바일 랭킹 | 90 / 97 / 100 → 100 / 97 / 100 | 3.61초 → 1.06초 | 0.032 → 0 | 370 → 359 KB |
| 데스크톱 홈 | 100 / 91 / 92 → 100 / 100 / 100 | 0.28초 → 0.29초 | 0.000 → 0.002 | 682 → 385 KB |
| 데스크톱 랭킹 | 96 / 97 / 100 → 100 / 97 / 100 | 0.86초 → 0.28초 | 0.105 → 0 | 379 → 370 KB |

홈 모바일 TBT는 기준선 4,457ms, 최종 표본 379ms였다. 개선 중 반복 측정은 285~4,325ms였으므로 일정한 TBT 개선으로 판단하지 않았다. 홈의 초기 전송량은 반복 측정에서 약 44% 줄었다. 랭킹 상세는 히스토리를 표 뒤로 옮긴 이후 초기 레이아웃 이동이 줄었고, 샘플 산점도의 작은 차트 링크는 Lighthouse `target-size` 항목에 남았다. 랭킹 기준선은 최초 요청을, 최종 측정은 같은 상세 주소를 한 번 읽은 서버를 사용했다. 서버 캐시와 로컬 머신 부하가 시간 차이에 포함된다. 최종 로컬 curl TTFB 표본은 홈 7ms, 국가 2페이지 12ms, 랭킹 6ms였다. 실사용 75번째 백분위수와 INP는 별도 운영 데이터에서 확인한다. [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) · [Core Web Vitals](https://web.dev/articles/vitals)

## 배포 범위

2026년 11월 28일 배포 후보는 최신 GitHub main의 공개 콘텐츠를 사용한다. 위의 3,696개 URL 및 Lighthouse 수치는 11월 27일 작업 폴더의 기준선·개선본을 비교한 값이다. 별도로 작업 중인 로컬 상관관계 UI와 그 SVG 수정은 배포 후보에 포함되지 않는다. 운영에 있는 법치주의 기존 주소 리디렉션과 11월 28일 발행 자료를 보존한다.

## 2026-11-28 운영 반영 결과

SEO 구현 커밋 `c129d80`의 Vercel 프로덕션 배포 `dpl_3xAuXqfrzq9Wr3WUfHdbLvwxmasU`가 READY였으며 `allranks.world` 연결을 확인했다. 로컬 후보와 운영 사이트맵의 공개 경로 3,730개가 일치했다. 운영 HTTP 회귀 352개가 통과했고 목록에서 연결되지 않는 사이트맵 경로는 0개였다. 기준 국가와 법치주의 별칭의 308, 잘못된 국가의 404, JSON API의 색인 제외 헤더, 11월 28일 컬럼 두 편과 기존 공개 랭킹의 200을 확인했다. 검색 크롤러 User-Agent를 사용한 별도 HTTP 표본은 18건이었다. 실제 검색 색인, AI 인용 및 실사용 지표는 후속 측정 항목이다. [운영 사이트](https://allranks.world) · [GitHub SEO 검사](https://github.com/eungene0204/allranks/actions/runs/46090382493)

## 운영자 실행 계획과 측정

| 시점 | 실행 및 기록 |
| --- | --- |
| 운영 반영 직후 | 운영 배포 승인 후 정규 홈, 랭킹, 국가 2페이지, 없는 국가, 검색, API, 사이트맵을 재검사한다. 원출처와 편집 해설이 있는 공개 표본으로 Google Rich Results Test 및 Schema Markup Validator를 확인한다. Search Console에서 Google 선택 canonical, 색인 상태 및 robots 테스트 결과를 확인한다. |
| 계정과 사이트맵 | 기존 소유권을 확인하고 Google Search Console·Bing Webmaster Tools·네이버 서치어드바이저에서 사이트맵을 제출 또는 갱신한다. 오류·제외 사유, 마지막 크롤링, 요청 URL, 색인 수를 기록한다. 집계 단위와 기간을 함께 보관한다. |
| 14일 후 | GSC·Bing·네이버의 노출·클릭·CTR·평균 게재순위 및 페이지별 검색어를 비교한다. GA4의 유기 검색 및 추천 방문을 정규 랜딩 URL로 집계한다. 질문형 검색어는 해당 가이드와 랭킹을 매핑해 성과를 분리하고, 주요 답변 상자는 고정 질문에 실제 표시된 경우만 기록한다. |
| 14일 후부터 정기 측정 | GSC의 생성 AI 보고서 노출 및 Bing AI Performance에서 표시되는 인용 수치를 각각 보관한다. GA4에서는 실제 리퍼러와 ChatGPT의 `utm_source=chatgpt.com`을 사용하고 식별할 수 없는 방문은 미분류로 둔다. Vercel에서 확인 가능한 봇 요청은 방문 상태와 403·429 비율을 기록한다. AI 유입, 사이트 언급, 출처 인용, 봇 요청은 각각 집계한다. |
| 28일 이후 | CrUX 데이터가 제공되는 경우 모바일·데스크톱을 나눠 페이지 또는 출처 p75의 LCP 2.5초, INP 200ms, CLS 0.1 목표를 검증한다. 데이터 부족 시 Lighthouse의 동일 조건 추세와 사용자 측정을 별도로 유지한다. |
| 계속 | `/guides`를 해석의 중심으로, 랭킹을 데이터 근거로, `/columns`를 검증된 편집 분석으로 운영한다. 신규 기획은 검색어 데이터와 원자료의 독창성·품질을 기준으로 정한다. 원자료의 새 판이나 계산 방식 변경이 확인되면 본문·출처·검증일 및 관련 내부 링크를 갱신한다. |

AI 답변 표본 질문은 다음 3개로 고정하고, Google AI Overviews·AI Mode, Copilot, 해당 환경에 제공되는 네이버 요약, ChatGPT Search, Gemini, Perplexity 및 Claude Search의 결과를 개별 기록한다.

- How does GDP per capita differ from total GDP?
- What does the World Bank ranking for the ability to track and trace consignments measure?
- How do Denmark and Norway compare in the 2026 World Justice Project Rule of Law Index?

표본 기록에는 실행일, 서비스와 검색 모드, 국가·언어·로그인 조건, 질문, AllRanks 언급 여부, 출처 URL, 인용 문장을 남긴다. 결과가 없거나 서비스에 접근할 수 없는 경우 해당 상태로 기록한다. GA4 관리자에서는 enhanced measurement의 Site Search 규칙과 자동 페이지뷰 중복을 확인하고 검색어와 이메일 리댁션을 검증한다. [Google 생성 AI 실적 보고서](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) · [Bing AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/) · [ChatGPT 퍼블리셔 FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq) · [GA4 데이터 리댁션](https://support.google.com/analytics/answer/13544947)

외부 신뢰도는 AllRanks의 계산을 재현할 수 있는 표본, 기준 기간, 검산 방법, 원자료 링크와 한계를 붙인 분석을 정규 주소에 공개하는 것부터 시작한다. 관련 데이터 커뮤니티·편집자에게 실제 질문에 답하는 분석 링크를 필요한 경우 공유한다. 보유한 공식 프로필이 확인되면 이름과 홈 링크를 일치시키고, 프로필 소유와 관계를 확인한 경우에만 sameAs를 적용한다. 운영 배포, 공식 계정 변경, 외부 발행, AI 학습 정책 결정과 방화벽 변경은 각각 운영자 승인 후 진행한다.

## 자체 평가

배점은 기술 품질과 검증 범위를 평가한다. 분모는 항목별 가중치다.

| 평가 | 항목별 점수 및 근거 | 합계 |
| --- | --- | --- |
| SEO | 크롤링·상태 29/30, 메타·canonical 24/25, 내부 탐색·사이트맵 19/20, 성능·접근성 12/15, 운영 측정 7/10. 초기 응답 검사와 전체 경로를 확인했으며 실제 색인 및 실사용 지표는 후속 검증이다. | 91/100 |
| AEO | 직접 답변 28/30, 의미 구조 18/20, 출처·단위·범위 22/25, 질문과 탐색 13/15, 답변 노출 샘플 8/10. 순위표와 표본 답변은 확인했고 전체 검색 수요와 답변 상자 실적은 측정 전이다. | 89/100 |
| GEO | 출처와 시점 27/30, 엔티티·편집 투명성 18/20, 검색 크롤러 설정 18/20, 재사용 가능한 설명 및 검증 16/20, 인용·추천 관측 8/10. 공식 봇 접근 설정 및 구조를 확인했고 서비스별 실제 인용 표본은 운영 반영 이후 수집한다. | 87/100 |

## 공식 자료

- canonical·페이지·색인 상태. [Google canonical 가이드](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) · [페이지 나누기](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading) · [HTTP 리디렉션](https://developers.google.com/search/docs/crawling-indexing/301-redirects) · [XML 사이트맵과 lastmod](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) · [Search Console URL 검사](https://support.google.com/webmasters/answer/9012289)
- 구현 및 측정. [Next.js 메타데이터](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) · [Next.js 스트리밍과 상태 코드](https://nextjs.org/docs/app/guides/streaming) · [Open Graph](https://ogp.me/) · [Chrome Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/) · [Core Web Vitals 기준](https://web.dev/articles/vitals) · [PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about) · [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

# AllRanks 프로젝트 계획

> 마지막 업데이트: 2026-10-15 · 현재 버전 0.2.0 (프로토타입)

## 1. 비전

"세상의 모든 랭킹을 한곳에서." 지구본 기반 탐색과 신뢰할 수 있는 출처 표기로, 국가·분야별 순위를 가장 쉽게 훑어볼 수 있는 사이트를 만든다.

## 2. 현재 상태 요약

- Next.js 16 정적 사이트, JSON 기반 데이터, 자동 수집 파이프라인 구축 완료
- 랭킹 647개 (세계 90 + US 24 + 165개국 533), OECD·G20·BRICS·EU·ASEAN 회원국 모두 국가 상세 보유(AU는 20개국 지역 랭킹 + 전 회원국 대학 순위), 153개국에 대학 순위, 7개 카테고리 (Economy, Education, Technology, AI, Society & Health, Energy & Industry, World Records)
- 랭킹 상단 시각화는 성격별 12종(지도·트리맵·대륙별 막대·원 패킹·와플·분포 스트립·히스토그램·산점도·발산 막대·버블맵·포디움·롤리팝)이며 `pickViz` 가 고르고 `ranking-viz` 스킬로 관리
- 페이지: 홈(지구본), 랭킹, 카테고리, 국가, 검색
- 커밋: 프로토타입 → 지구본 재작성 + 국가 페이지/국가 한정 랭킹 → 프로젝트 문서 추가

## 3. 마일스톤

| # | 마일스톤 | 상태 | 비고 |
| --- | --- | --- | --- |
| M1 | 프로토타입: 세계 랭킹 몇 개 + 지구본 + 기본 페이지 | ✅ 완료 | 초기 커밋 |
| M2 | 데이터 파이프라인: 레지스트리, World Bank/Wikipedia/Economist/Ookla 어댑터, 검증, 안전장치 | ✅ 완료 | |
| M3 | 랭킹 확장: 세계 36개, 국가 한정(scope) 랭킹 구조, US 20개 | ✅ 완료 | |
| M4 | 국가 상세 페이지 + 로고 지원 | ✅ 완료 | |
| M5 | 정리·품질: 수동 랭킹 4종 검증, 메타데이터/SEO 점검, 테스트 | ⬜ 예정 | 다음 작업 후보 |
| M6 | 배포: 호스팅 선택, 도메인, `NEXT_PUBLIC_SITE_URL` 설정 | 🚧 진행 | Vercel, 기준 도메인은 `allranks.world`(`www`는 308로 apex로 리다이렉트). AdSense 준비물(ads.txt·정보 페이지·스크립트·메타 태그)은 배포되어 `/ads.txt`와 스크립트가 라이브에서 확인됨. AdSense 사이트 확인·심사와 Search Console 등록은 남음 |
| M10 | 빈 카테고리 채우기: AI, Markets, Energy, Money, Demographics, Mining, Autos, Green 주제에 자동 수집 랭킹 39개(이후 7개 카테고리로 통합) | ✅ 완료 | `scripts/topics.mts`. 수집 대상은 모두 어댑터(재현 가능). 금 생산국은 출처 표 결측 때문에 제외 |
| M7 | 자동화: 정기 데이터 갱신(CI/cron), 데이터 신선도 알림 | 🚧 진행 | 주간 워크플로 작성됨(미실행). 신선도 알림은 미구현 |
| M9 | AI 데이터 수집 에이전트: 없는 랭킹 발굴(discover) + 기존 랭킹 최신화(refresh) | 🚧 v0 구현 | 도구·루프·가드·CLI 완료, 모의 클라이언트로 검증. **실제 API 실행 미검증** |
| M8 | 확장: 다른 나라 지역 랭킹, 카테고리 추가, 다국어 | 🚧 진행 | 165개국 533개 국가 한정 랭킹 완료(OECD·G20·BRICS·EU·ASEAN·AU 주요국 포함, 대학 순위 153개국). 카테고리·다국어는 미착수 |

## 4. 백로그

우선순위: 🔴 높음 · 🟡 중간 · 🟢 낮음

- 🔴 수동 랭킹(QS 대학, 휘발유, 행복지수, 최고층 빌딩) 값 검증 → `verified: true`
- 🟡 페이지별 메타데이터/OG 이미지 점검 (FR-41)
- 🟡 Google Search Console 등록(도메인 속성, DNS TXT 인증) 후 `sitemap.xml` 제출 — 재배포 뒤에 진행
- 🟢 시각화 확장: 상위 N 막대 차트(공유용 이미지), 국가 페이지 레이더/비교, 연도별 추이
- 🟢 해설 확장: 국가·카테고리 페이지에도 자동 해설, 랭킹별 사람이 쓴 설명 추가
- 🔴 AdSense: AdSense 화면의 "I've placed the code" 체크 후 Verify(라이브 사이트에 스크립트 배치 완료) → 심사 요청 → Privacy & messaging에서 EEA 동의 메시지 설정. 다른 사이트에서 'Low value content'로 반려된 사례가 있어, 순위별 해설 문장 등 독자 가치 보강 필요
- 🟡 배포 환경 결정 및 배포
- 🟡 기본 테스트 추가 (데이터 로더, 포맷, 순위 계산)
- 🟢 국가별 랭킹 보강: KR·JP 등 대학 순위(공개 소스 없음), 오래된 표(JP 기업 2022·KR 기업 2023·BR 공항 2022) 갱신, 더 많은 국가
- 🟢 접근성·반응형 기준 정의 및 점검 (NFR-07)
- 🟢 다국어 지원 검토
- 🔴 에이전트 첫 실제 실행: `ANTHROPIC_API_KEY` 설정 후 `npm run agent -- discover --dry --max-new 1` → 결과 품질 점검 → 비드라이 실행
- 🔴 GitHub 저장소에 `ANTHROPIC_API_KEY` 시크릿, Actions의 PR 생성 권한 설정 후 `data-agent.yml` 수동 실행(workflow_dispatch)
- 🟡 신규 카테고리 추가 랭킹: 어댑터로 계속 확장 (금/은 등 광물은 더 나은 출처 탐색, 국가별 데이터센터 수는 현재 25개국 agent 랭킹이라 사람 검증·더 나은 공개 출처 필요)
- 🟡 신규 39개 랭킹의 값·단위를 사람이 한 번 훑어 검증 (특히 `ai-private-investment` 2025년 값)
- 🟡 에이전트: 자동 파이프라인 실패 시 원인 진단·어댑터 수정 제안 (v1)
- 🟡 에이전트: 출처 페이지 재검증 단계(독립 검증 호출) 및 `verified` 승격 절차
- 🟡 에이전트: 실행 비용 기록·월 상한, 데이터 신선도 알림
- 🟢 에이전트: 국가 내부 랭킹(`scope`) 발굴 전략, 정규 소스 목록(source registry) 관리

## 5. 리스크

| 리스크 | 영향 | 대응 |
| --- | --- | --- |
| AI 에이전트가 틀린 값·출처를 제출 | 신뢰도 하락 | 도구 가드 + `verified:false` 표기 + PR 사람 검토 + 시스템 프롬프트의 "기억으로 채우지 말 것" 규칙. 장기적으로 독립 재검증 단계 |
| 에이전트 API 비용 폭주 | 예산 초과 | 턴·토큰·개수 한도, 주 1회 스케줄, 프롬프트 캐시 |
| Wikipedia 표 구조 변경으로 어댑터 실패 | 데이터 갱신 불가 | 안전장치로 기존 파일 유지, 어댑터 수정 |
| 수동 데이터 부정확 | 신뢰도 하락 | "Sample data" 라벨, 검증 일정 수립 |
| Next.js 16 breaking change | 코드 작성 오류 | 작업 전 `node_modules/next/dist/docs/` 확인 (AGENTS.md) |
| 데이터 증가에 따른 빌드 시간 | 배포 지연 | 필요 시 로더 캐시/분할 검토 |
| 라이선스(CC BY-SA 등) 미준수 | 법적 문제 | 출처·라이선스를 사이트에 계속 표기 |

## 6. 변경 이력

| 날짜 | 변경 |
| --- | --- |
| 2026-10-14 | 기준 도메인을 apex `allranks.world` 로 변경(Vercel에서 `www` → apex 308 리다이렉트). 리다이렉트 때문에 AdSense 사이트 확인이 실패해서이며, `SITE_URL` 기본값·README·문서를 apex 로 갱신 |
| 2026-10-14 | 랭킹마다 다른 시각화: `lib/viz.ts`(`pickViz`)와 트리맵·분포 스트립·발산 막대·버블맵·롤리팝 컴포넌트 추가, 지도는 비율 랭킹 전용으로 축소. 선택·검증 절차를 프로젝트 스킬 `.claude/skills/ranking-viz` 와 `npm run viz:report` 로 정리하고 CLAUDE.md 에 매번 사용 규칙 추가 |
| 2026-10-14 | AdSense 배포 상태 반영: 라이브 사이트에서 `/ads.txt`(pub-8335444243080631)와 AdSense 스크립트·메타 태그 확인. M6 비고와 백로그의 AdSense 단계(배포·ads.txt 확인 완료분 제외) 갱신 |
| 2026-10-14 | 랭킹 페이지에 국가별 색상 세계지도 추가(`RankingMap`, `lib/map.ts`, `scripts/map-codes.mts`, `data/map-codes.json`): 순위 5등분 색, 범례, 클릭 시 국가 페이지, 서버 렌더링 SVG |
| 2026-10-14 | 랭킹 페이지에 자동 생성 해설 "Highlights" 추가(`lib/insights.ts`, `RankingInsights`): 1~3위, 격차, 범위·중앙값, 대륙 분포, 국가별 항목 수, 출처. meta description 에도 상위 3개 요약 반영(AdSense 'Low value content' 대응) |
| 2026-10-14 | `robots.txt`(`src/app/robots.ts`) 추가: 전체 허용, `/search` 제외, 사이트맵 위치 명시(Search Console 등록 준비) |
| 2026-10-14 | AdSense 게시자 ID(`pub-8335444243080631`)를 기본값으로 설정해 환경변수 없이도 `/ads.txt`·스크립트 활성화 |
| 2026-10-14 | 사이트 URL 기본값을 `https://www.allranks.world` 로 설정(Vercel에 환경변수가 없어 사이트맵이 localhost로 나가던 문제 수정) |
| 2026-10-14 | 연락처 이메일 `allworldranks@gmail.com` 을 About·Privacy 페이지 기본값으로 설정 |
| 2026-10-14 | AdSense 준비: `/ads.txt`(환경변수 `NEXT_PUBLIC_ADSENSE_CLIENT` 설정 시), About·Methodology·Privacy 페이지, 푸터 링크, AdSense 스크립트·메타 태그(`src/lib/site.ts`) |
| 2026-10-14 | 국가별 데이터센터 수 랭킹(`data-centers`, 25개국, 2025년) 추가: 웹 조사로 수집한 agent 랭킹(`verified:false`), 가드(`Toolbox.create_ranking`) 통과. 세계 랭킹 90개 |
| 2026-10-14 | AI 카테고리 랭킹 14개 추가(2→16): Epoch AI GPU 클러스터(`sources/epoch.mts`)로 AI 슈퍼컴퓨터 수·연산력·전력·최대 클러스터, TOP500·반도체 수출(Wikipedia), AI 논문·채용·생성형 AI 이용률·로봇 밀도(OWID), 연구원·첨단기술·IT서비스 수출(World Bank). 총 469개 |
| 2026-10-14 | 헤더 메뉴 15개를 7개로 통합(AI는 독립): Prices·Markets·Money→Economy, Health·Demographics→Society & Health, Mining·Autos·Green→Energy & Industry. 랭킹 JSON 36개와 파이프라인 정의의 `category` 갱신 |
| 2026-10-14 | GeoNames 대도시 순위(`scripts/regional/geonames.mts`) 110개국 + Wikidata 1차 행정구역 인구 순위(`scripts/regional/wikidata.mts`) AU 16개국 추가: 총 647개(165개국 533). AU 55개국 중 위키피디아 표가 없던 나라도 도시·(일부) 지역 랭킹 보유 |
| 2026-10-14 | EU 잔여 5개국(BG·HR·CY·MT·RO), ASEAN 잔여 7개국(SG·PH·MM·KH·LA·BN·TL), 아프리카연합 주요 16개국(DZ·MA·KE·GH·TZ·UG·TN·AO·CI·CM·SN·ZM·ZW·MZ·SD·CD)의 국가 한정 랭킹 51개 추가: 총 520개. EU 27·ASEAN 11 전 회원국이 국가 상세 보유, AU는 표가 있는 20개국만 지역 랭킹 |
| 2026-10-14 | BRICS 신규·파트너(AE·ET·IR·NG·VN·KZ·BY·UZ) 추가(G20은 기존 국가로 이미 충족). 독립국 153개국에 OpenAlex 기반 대학 순위(`scripts/regional/openalex.mts`) 추가: 총 455개 |
| 2026-10-14 | OECD 나머지 16개국(CL·CO·CR·CZ·DK·EE·HU·IE·IL·IS·LT·LU·LV·PT·SI·SK) 국가 랭킹 41개 추가: OECD 38개 회원국 전부 국가 상세 보유(총 244개) |
| 2026-10-14 | 주요 32개국(한국 포함) 국가 상세 확장: `scripts/regional/` 모듈로 지역 인구·GDP, 도시, 마천루, 공항, 일부 대학·기업 랭킹 143개 추가(총 203개). 국가 페이지 상단에 핵심 지표(인구·GDP·1인당 GDP·기대수명·면적)+세계 순위 추가 |
| 2026-10-14 | 빈 카테고리 8개를 자동 어댑터 랭킹 39개로 채움: World Bank 지표 21개, Our World in Data(`sources/owid.mts`) 2개, Wikipedia 표(`sources/wikipedia-topics.mts`) 16개. `Pipeline.minItems` 추가(짧은 목록 허용), Wikipedia 병합 셀 오파싱 방지 |
| 2026-10-14 | AI 데이터 수집 에이전트 v0 시작: `scripts/agent/`(discover/refresh/plan), 검증 로직 공용화(`scripts/lib/check.mts`), `source.kind: "agent"` 와 사이트 표시, `@anthropic-ai/sdk` 추가, 주간 워크플로 `.github/workflows/data-agent.yml` |
| 2026-10-14 | 랭킹 카드의 순위 숫자를 12px → 18px, 원형 배지를 22px → 32px로 확대 |
| 2026-10-14 | 상단 헤더 검색창과 관련 상태·이벤트·전용 스타일 삭제. 홈 통합 검색창과 결과 페이지 재검색은 유지 |
| 2026-10-14 | 지구본 하단 Badges show… 조작 안내 문구와 전용 CSS 삭제 |
| 2026-10-14 | 삭제한 홈 리더보드 위치에 통합 검색창 추가. 국가명·코드와 관련 랭킹 검색, 항목 이름·상세 설명 검색 및 순위·값을 포함한 결과 표시. 결과 페이지에서 재검색 지원 |
| 2026-10-14 | 홈 지구본 하단의 Country leaderboard, 선택 국가 상세 패널, 국가 선택 버튼 및 Show all 버튼 삭제. 관련 상태·전용 CSS 정리 |
| 2026-10-14 | 기존 메뉴·랭킹 분류를 유지하고 AI, Markets, Energy, Money, Demographics, Mining, Autos, Green 카테고리 추가. 총 15개 분야, 빈 카테고리는 준비 중 안내. Maps는 제외 |
| 2026-10-14 | 모든 카테고리에서 세계 랭킹을 국가 내부 랭킹보다 먼저 표시. World Records의 세계 기준 전용 필터 유지 |
| 2026-10-14 | World Records 카테고리에서 국가 내부 랭킹을 제외하여 세계 기준 기록만 표시 |
| 2026-10-14 | 국가 상세 이동 지연 개선: 국가별 랭킹 JSON 중복 읽기 제거, 요청 내 국가 집계 캐시, 국기 hover/focus 및 국가 선택 시 상세페이지 prefetch 적용 |
| 2026-10-14 | 지구본 배경 클릭/드래그 시작 시 국가 선택 및 국기 포커스를 해제하여 버블 상자 닫기 |
| 2026-10-14 | 홈의 Browse by category 제목 및 카테고리 카드 영역 삭제. 지구본 다음에 Popular rankings 표시 |
| 2026-10-14 | 랭킹 카드의 긴 이름에 말줄임표 적용. 값의 너비를 유지하고 카드 밖으로 넘치는 현상 수정 |
| 2026-10-14 | 헤더 카테고리 메뉴를 가운데 정렬. 좁은 화면에서는 시작 메뉴부터 가로 스크롤 가능하도록 safe center 적용 |
| 2026-10-14 | 헤더 최대 너비를 1440px로 확장하여 World Records 잘림 수정. 카테고리는 한 줄로 유지하고 좁은 화면에서는 가로 스크롤 지원 |
| 2026-10-14 | 문서 갱신 규칙을 "커밋 시점에 반영, 같은 커밋에 포함"으로 변경하고 커밋 관련 낡은 문구 정리 |
| 2026-10-14 | 문서 3종(project_plan / srs / software_architecture) 및 CLAUDE.md 최초 작성. 현재 코드베이스 기준으로 상태 정리 |
| 2026-10-15 | 시각화 6종 추가(`regions`·`packed`·`waffle`·`histogram`·`scatter`·`podium`), `d3-hierarchy` 의존성 추가, `VIZ_PAIRS` 로 관련 랭킹 산점도, 대륙 고정색 팔레트 검증, `ranking-viz` 스킬 규칙 표를 순서 있는 12종으로 개정 |
| 2026-10-15 | 랭킹 페이지가 자기 값만 그리도록 `VIZ_PAIRS`(산점도 짝)를 비움(인터넷 이용률 페이지에 GDP 축이 나오던 문제), 산점도 축 이름 `AXIS_NAMES` 추가, 원 패킹 버블에 즉시 뜨는 툴팁(`data-tip`) 적용 |

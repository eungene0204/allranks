# AllRanks 소프트웨어 아키텍처

> 마지막 업데이트: 2026-10-14 · 버전 0.2.0

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
| 지구본 | `d3-geo`(orthographic 투영), `topojson-client`, `world-atlas`(110m) — Canvas/SVG 직접 렌더링 |
| 데이터 스크립트 | Node 네이티브 TypeScript 실행(`.mts`), 추가 의존성 없음 |
| 린트 | `tsc --noEmit` (`npm run lint`) |
| 포트 | 개발/프로덕션 모두 3100 |

## 3. 디렉터리 구조

```
data/
  countries.json            국가 참조 테이블 (mledoze/countries 기반)
  rankings/<id>.json        랭킹 1개 = 파일 1개 (현재 56개: 세계 36 + US 20)
scripts/
  update.mts                랭킹 데이터 갱신 CLI
  validate.mts              data/rankings 검증 (prebuild에서 자동 실행)
  countries.mts             countries.json 갱신
  registry.mts              자동 랭킹 등록부 (메타데이터 + 소스 어댑터 연결)
  lib/                      http, wikipedia(캐시·스로틀), countries, csv, types
  sources/                  소스 어댑터: worldbank, bigmac, wikipedia-world, wikipedia-us, wikipedia-speed
src/
  app/
    layout.tsx, globals.css, not-found.tsx, sitemap.ts
    page.tsx                         홈 (지구본 + 카테고리 + 랭킹 카드)
    ranking/[id]/page.tsx            랭킹 상세
    category/[id]/page.tsx           카테고리별 목록
    country/[code]/page.tsx          국가 상세 (국가 한정 랭킹 + 세계 랭킹 내 순위)
    search/page.tsx                  검색
  components/
    GlobeExplorer.tsx   인터랙티브 지구본 (클라이언트 컴포넌트, ~600줄)
    RankingCard / RankingTable / RankBadge / SourceLine / Header / Mark
    CountryRegional.tsx 국가 페이지의 지역(주·도시 등) 랭킹 탭
  lib/
    types.ts            웹과 스크립트가 공유하는 타입 (RankingFile 등)
    categories.ts       카테고리 정의
    data.ts             JSON 로더 + 집계 (server-only)
    format.ts           값 포맷, 순위 계산, 국기 이모지
public/logos/           항목 로고 (<domain>.png)
```

## 4. 데이터 모델

핵심 타입은 `src/lib/types.ts`의 `RankingFile`이며 스크립트와 웹이 함께 import한다.

- **RankingFile**: `id`(파일명과 동일), `title`, `short?`, `category`, `icon`, `desc`, `unit/prefix/suffix/decimals`,
  `order`(`asc`|`desc`), `scope?`, `multi?`, `year`, `asOf?`, `source`, `updatedAt`, `items[]`
- **Item**: `name`, `country`(ISO-2), `value`, `logo?`, `detail?`
- **Source**: `kind`(`api`|`csv`|`wikipedia`|`manual`), `name`, `url?`, `license?`, `verified?`, `note?`
- **scope**: ISO-2 코드가 있으면 "그 나라 내부 랭킹"(예: US 주). 세계 집계·홈에서 제외되고 `/country/<code>`에만 표시된다.
- **multi**: 한 국가가 여러 번 등장 가능한 목록(도시, 웹사이트 등).

파생 타입(`CountrySummary`, `CountryAppearance`, `RankedEntry`)은 `data.ts`에서 계산되며 디스크에 저장되지 않는다.

## 5. 데이터 파이프라인

1. `registry.mts`가 자동 랭킹의 메타데이터와 소스 어댑터를 선언한다 (`worldBankRankings()`, `usRankings()` 등).
2. `update.mts`가 어댑터를 실행해 `{ year, source, items }`를 받고 JSON을 다시 쓴다. 내용이 바뀐 경우에만 쓴다.
3. **안전장치**: 숫자가 아닌 값, 중복 국가, 항목 20개 미만, 이전 대비 30% 초과 감소 시 **기존 파일 유지 + 비정상 종료**.
4. `validate.mts`가 스키마·국가 코드·중복·카테고리를 검사한다. 오류면 빌드 실패, 120일 초과 자동 데이터는 경고.
5. 수동 랭킹(QS 대학, 휘발유, 행복지수, 최고층 빌딩)은 JSON을 직접 편집하며 `verified: false`면 사이트에 "Sample data"로 표시.

## 6. 렌더링 전략

- 모든 페이지는 빌드 시 `src/lib/data.ts`가 `data/`를 읽어 정적으로 생성된다 (`generateStaticParams` 사용).
- `data.ts`는 `server-only`; 프로덕션에서는 랭킹 목록을 메모리에 캐시한다.
- `GlobeExplorer`만 클라이언트 컴포넌트이며, 서버에서 만든 `CountrySummary[]`를 props로 받는다.
- 국가 순위 집계: 1위 횟수 → 3위 이내 횟수 → 등장 횟수 → 이름순.
- 사이트 URL은 `NEXT_PUBLIC_SITE_URL`(없으면 `http://localhost:3000`)을 사이트맵에서 사용한다.

## 7. 확장 지점

| 하고 싶은 일 | 수정할 곳 |
| --- | --- |
| 자동 랭킹 추가 | `scripts/sources/`에 어댑터 → `scripts/registry.mts` 등록 → `npm run data:update -- <id>` |
| 수동 랭킹 추가 | `data/rankings/<id>.json` 작성 (`RankingFile` 준수) |
| 카테고리 추가 | `src/lib/categories.ts` |
| 새 나라의 지역 랭킹 | `scope`에 ISO-2 코드를 가진 랭킹 추가 (국가 페이지가 자동 반영) |
| 항목 로고 | `public/logos/<domain>.png` + 항목에 `logo` |

## 8. 제약과 알려진 사항

- 배포 대상/호스팅은 아직 정해지지 않음 (`project_plan.md` 참조).
- 테스트 프레임워크 없음. 현재 품질 게이트는 `tsc --noEmit` + `data:validate`.
- 데이터가 JSON 파일이므로 랭킹/항목 수가 크게 늘면 빌드 시간·저장소 크기 재검토 필요.

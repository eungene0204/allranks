<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 작업 완료 후 문서 업데이트

모든 작업이 끝나면 완료 보고 전에 다음 문서를 확인하고, 작업 내용을 반영하여 최신 상태로 업데이트한다.

- `software_architecture.md`: 구조, 구성 요소 및 기술 설계 변경 사항
- `srs.md`: 요구사항, 동작 및 구현 상태 변경 사항
- `project_plan.md`: 작업 진행 상태, 완료 내역 및 후속 계획

## 랭킹 검증 및 게시 책임

- 랭킹 신규 작성·갱신 시 `/Users/eugene/.codex/skills/allranks-verify-publish/SKILL.md` 스킬을 읽고 적용한다.
- `verified:false`인 자료는 절대 게시하지 않는다. 수동·에이전트 자료는 어시스턴트가 직접 출처를 대조하고 `verified:true`로 확정한 뒤 공개한다. 검증은 작업 중 바로 수행하며 사용자에게 넘기지 않는다.

- 랭킹을 만들거나 수정한 Codex/AllRanks 어시스턴트가 검증 책임자다. 사용자에게 검증을 맡기거나 검증 주체를 묻지 않는다.
- `verified: true`로 저장하기 전에 링크된 원출처를 직접 열어 각 제품명·선정 근거·순서·판/연도를 확인하고, 출처가 뒷받침하지 않는 제품이나 수치 점수를 추가하지 않는다.
- 출처가 부문별 추천만 제공해 직접 비교가 불가능하면 그 한계를 데이터 설명과 화면 문구에 밝힌다. 충분히 확인하지 못한 목록은 비공개 초안(`verified:false`)으로 남기고, 확인 가능한 대체 출처를 조사한다.

## Gotchas

- 2026-11-13 | 실패 원인: 출처 접근 기록의 배열 키를 확인하지 않고 observations로 가정해 추가 스크립트가 실패함 → 재발 방지: JSON 최상위 키를 읽고 기존 sources 스키마로 추가하며 저장 후 URL을 다시 읽어 확인한다. sources로 수정하고 신규 URL 저장을 확인함.

- 2026-11-14 | 실패 원인: 신규 수동 랭킹의 출처 접근성 기록을 누락해 editorial 빌드 검사가 실패함 → 재발 방지: 신규 랭킹 작성 시 원출처 조회와 함께 data/editorial/source-access.json의 sources에 접근 기록을 추가하고 저장된 URL 및 빌드 사전 검사를 확인한다.

- 2026-11-23 | 실패 원인: 랭킹 화면 검증에서 `td`만 조회해 `th[scope=row]`에 표시된 시스템 이름을 누락함 → 재발 방지: 렌더링된 행의 헤더와 값 셀을 확인한 뒤 검증하고 각 행의 순위·이름·수치를 비교한다. 선택자를 수정해 TOP500 10개 행의 일치를 확인함. 국기나 차트 셀이 있으면 순위·이름·값의 실제 요소(.rk, .name-text, td.val)를 각각 선택한다. EF 랭킹 10개 행과 404를 확인함.

- 2026-11-27 | 실패 원인: IPC HTML의 줄바꿈과 탭을 그대로 둔 채 대회 종목 수를 문자열로 확인해 저장 전 검사가 중단됨 → 재발 방지: HTML 요약 문구를 검사할 때 연속 공백을 정규화한 뒤 대회 날짜와 종목 수를 확인한다. 정규화 후 상위 10개 행과 출처 접근 기록의 저장을 확인함.

- 2026-11-27 | 실패 원인: 일일 갱신 절차를 읽은 뒤 사용자 작업 트리에서 먼저 갱신 후보를 조회함 → 재발 방지: 배포용 갱신 후보를 조회하기 전에 자동화 체크아웃 경로와 HEAD·origin/main 일치를 확인하고 그 체크아웃에서 계획 명령을 실행한다. 동기화된 자동화 체크아웃에서 후보를 다시 확인하고 해당 파일만 갱신함.
- 2026-11-27 | 실패 원인: 지역 통계 검증에서 현지어·영어 지명과 Python 기본 정렬이 일치한다고 가정해 전수 대조가 중단됨 → 재발 방지: 스웨덴 원자료의 지명은 공식 지역 코드로 연결하고 독일 원자료의 번역명은 명시적으로 대조한다. 값과 동점 정렬을 따로 검증하고 순서는 사이트와 같은 localeCompare로 확인한다. 310개 지역 행과 23개 파일의 저장 순서를 검증함.
- 2026-11-27 | 실패 원인: 카테고리의 첫 페이지에서 모든 랭킹을 찾을 수 있다고 가정해 화면 검증이 중단됨 → 재발 방지: 카테고리의 정렬 순서와 페이지 크기에서 대상 랭킹이 있는 페이지를 계산한 뒤 링크를 확인한다. Economy 4페이지에서 휘발유 링크를 확인함.
- 2026-11-27 | 실패 원인: 운영 사이트맵 검증에서 ElementTree.iter에 XML 네임스페이스 와일드카드를 전달해 등록 URL을 읽지 못함 → 재발 방지: findall(".//{*}loc")으로 URL을 추출하고 전체 건수를 먼저 확인한 뒤 대상 URL을 대조한다. 배포 대기 랭킹 16개의 사이트맵 등록과 HTTP 200을 확인함.
- 2026-11-27 | 실패 원인: 배포 범위를 main의 갱신 커밋으로만 대조해 사용자 작업 폴더에만 있던 록 랭킹과 법치주의 주소를 놓침 → 재발 방지: 전체 반영 여부를 답하기 전 사용자 측 랭킹 ID와 운영 사이트맵을 비교하고 동일 원자료의 다른 주소도 확인한다. 록 랭킹을 원문 200행과 대조하고 법치주의 점수 143개를 운영본과 대조함.
- 2026-11-27 | 실패 원인: Rolling Stone의 페이지 식별자를 숫자로, 페이지별 canonical을 개별 주소로 가정해 원문 대조가 중단됨 → 재발 방지: 목록 식별자는 문자열로 비교하고 페이지별 첫 항목 slug와 페이지당 50개 제목을 확인한다. 원문 네 페이지에서 순위 1~200의 제목·아티스트·연도가 일치함을 확인함.

- 2026-11-27 | 실패 원인: 별도 작업 트리의 node_modules를 다른 체크아웃으로 링크해 Turbopack이 Next.js를 해석하지 못함 → 재발 방지: 새 작업 트리에서 프로덕션 빌드 전 npm ci로 의존성을 직접 설치한다. 직접 설치 후 빌드와 로컬 HTTP 검사를 통과함.

- 2026-11-27 | 실패 원인: 컬럼 최초 검증에서 HTML 노출만 확인해 카드 한 장이 빈 그리드 열 때문에 좁아지는 문제를 놓침 → 재발 방지: 카드 목록의 첫 배포에서 카드 한 장과 여러 장을 데스크톱·모바일 브라우저에서 렌더링하고 카드 폭을 컨테이너 폭과 대조한다. 홈과 아카이브에서 한 장이 전체 폭을 사용함을 확인함.

- 2026-11-28 | 실패 원인: TOP500 원본 HTML에 브라우저가 보완하는 `tbody`가 있다고 가정해 행을 읽지 못함 → 재발 방지: 원본에서 `table tr`로 헤더와 데이터 행을 확인한 뒤 순위·이름·수치를 대조한다. 두 공식 표에서 각각 100개 데이터 행과 상위 10개 항목을 확인함.

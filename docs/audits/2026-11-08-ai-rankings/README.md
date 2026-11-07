# AI 랭킹 확충 — 2026-11-08

AllRanks 어시스턴트가 공식 원자료 전체를 직접 내려받아 대조했다. 신규 21개 랭킹, 1,147개 평가 행을 추가해 AI 카테고리는 기존 11개에서 32개가 되었다. 공개용 원장은 모두 `source.verified:true`이다. 이번 수집에서 미검증 초안은 남기지 않았다.

## 출처와 해석

- LiveBench v2: 2026-10-25 평가판, 32개 모델 설정 × 종합 및 7개 영역. 종합은 Long Agentic ×2, Coding ×1.5, Design ×1.5, 나머지 ×1의 가중평균이다.
- LiveBench v1: 2026-06-25 평가판, 71개 모델 설정 × 종합 및 7개 영역. 영역 점수는 공식 categories 매핑의 과제별 점수 산술평균, 종합은 7개 영역의 동일 가중평균이다. 평가판 날짜는 모델 출시 마감일을 뜻하지 않는다.
- SWE-bench: 공식 저장소 commit `193160a463a435d05cf44a1fa9dc5eac832113c3`의 Multilingual, Test, Verified, Lite, Multimodal 전체 제출 323개. 이름이 중복되는 경우 제출 ID를 이름에 덧붙이고 모든 행 detail에 원 제출 ID/날짜/에이전트/원 제공자 checked 여부를 보존했다.
- SWE-bench는 각 제출의 도구·시도 횟수·예산 등이 달라 순수 모델 성능 순위로 해석할 수 없다. 원 제공자가 checked:false로 표시한 제출도 그대로 명시했으며 AllRanks의 원문 대조 검증과 구분했다. 각 표의 마지막 제출일은 2025~2026년 초로, 2026년 11월 최신 모델 전체를 포괄한다고 주장하지 않는다.
- 원 점수의 내림차순 정렬이며 동점 처리는 기존 UI를 따른다. 국가 추정이나 임의 점수는 추가하지 않았다. 원시 모델 ID 및 추론 노력/미세조정 설정을 유지했다.

## 검증

`manifest.json`의 원자료 SHA-256과 보관 파일을 대조하고, 별도 Decimal 재계산으로 LiveBench 전 항목 및 종합값, SWE-bench의 이름·제출 ID·수치·날짜·checked를 대조했다. `reconciliation.json`에 21개/1,147개 전수 일치를 기록했다. 원자료 gzip의 해시는 압축 해제 바이트 기준이다.

`npm run data:validate`: 3,430 files, 오류 0, 경고 0. `npm run lint`: 통과. 클라이언트 카탈로그 재생성 완료. 기존 공개 필터는 수정하지 않았다.

별도 임시 복사본의 Next.js 16.4.3 Turbopack 개발 서버에서 신규 상세 21개의 제목/1위/오류 없는 렌더링, AI 카테고리와 사이트맵의 21개 ID, 검색 응답을 검사했다. 임시 복사본에만 만든 verified:false fixture는 카테고리·사이트맵·생성 카탈로그에서 제외되고 직접 접근은 notFound 404 경계 및 noindex를 반환했다. 개발 스트리밍 응답의 HTTP 상태는 200이므로 운영 HTTP 404 검증을 주장하지 않는다. 증빙: `http-checks.json`. 브라우저 연결이 없어 스크린샷 검사는 수행하지 않았다.

기존 localhost:3100 서버는 HTTP 500을 반환했다. 임시 QA에서 webpack은 기존 scripts/lib/csv.mts의 TypeScript 구문 처리에 실패했으며, Turbopack 기본 빌드 경로에서 검증했다. 기존 서버/소스는 수정하지 않았다. 운영 배포는 수행하지 않았다.

## 추가 목록

- `livebench-v2-overall-2026` — 32개 평가 행
- `livebench-v2-long-agentic-2026` — 32개 평가 행
- `livebench-v2-reasoning-2026` — 32개 평가 행
- `livebench-v2-coding-2026` — 32개 평가 행
- `livebench-v2-browser-2026` — 32개 평가 행
- `livebench-v2-data-analysis-2026` — 32개 평가 행
- `livebench-v2-research-2026` — 32개 평가 행
- `livebench-v2-design-2026` — 32개 평가 행
- `livebench-v1-overall-2026` — 71개 평가 행
- `livebench-v1-reasoning-2026` — 71개 평가 행
- `livebench-v1-coding-2026` — 71개 평가 행
- `livebench-v1-agentic-coding-2026` — 71개 평가 행
- `livebench-v1-mathematics-2026` — 71개 평가 행
- `livebench-v1-data-analysis-2026` — 71개 평가 행
- `livebench-v1-language-2026` — 71개 평가 행
- `livebench-v1-instruction-following-2026` — 71개 평가 행
- `swe-bench-multilingual-agents` — 13개 평가 행
- `swe-bench-test-agents` — 24개 평가 행
- `swe-bench-verified-agents` — 180개 평가 행
- `swe-bench-lite-agents` — 84개 평가 행
- `swe-bench-multimodal-agents` — 22개 평가 행


## 운영 배포 완료

2026-11-08 커밋 fcb2bfe 배포 완료. Vercel READY 및 allranks.world 연결 확인. 운영 상세 21개 제목/1위, 카테고리·사이트맵 21개 ID, 검색 및 존재하지 않는 상세 HTTP 404 검사 통과. 최신 main 기준 AI 카테고리는 총 35개다. 증빙: production-http-checks.json, deployment.json.

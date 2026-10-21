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

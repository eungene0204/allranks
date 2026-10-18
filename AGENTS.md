<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 랭킹 데이터 기준연도

기준연도(`year`)가 2025년 이하인 데이터는 랭킹으로 만들거나 저장하지 않는다. 2026년 이후 데이터만 사용한다. 자료의 발행일·갱신일·`asOf`가 2026년이어도 실제 데이터의 기준연도가 2025년 이하라면 제외한다.

## 작업 완료 후 문서 업데이트

모든 작업이 끝나면 완료 보고 전에 다음 문서를 확인하고, 작업 내용을 반영하여 최신 상태로 업데이트한다.

- `software_architecture.md`: 구조, 구성 요소 및 기술 설계 변경 사항
- `srs.md`: 요구사항, 동작 및 구현 상태 변경 사항
- `project_plan.md`: 작업 진행 상태, 완료 내역 및 후속 계획

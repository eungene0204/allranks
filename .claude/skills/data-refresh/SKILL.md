---
name: data-refresh
description: 모든 랭킹을 최신 데이터로 갱신한다. "최신 데이터로 업데이트", "오래된 랭킹 갱신", "data refresh", 특정 랭킹의 기준 연도가 낡았다는 말이 나오면 사용한다. 파이프라인 일괄 실행(npm run data:update) → 신선도 점검(npm run data:freshness) → 수동/에이전트 랭킹 재조사 순서로 진행한다.
---

# data-refresh — 랭킹 최신화

웹사이트가 읽는 것은 `data/rankings/<id>.json` 뿐이다. 랭킹은 세 종류로 갱신된다.

| 종류 | 어디서 | 갱신 방법 |
| --- | --- | --- |
| 자동 파이프라인 (`source.kind` = api / csv / wikipedia) | `scripts/registry.mts`, `topics.mts`, `regional/*.mts` | `npm run data:update` — 출처의 **현재 최신판**을 다시 받는다 |
| 수동 (`manual`) / 에이전트 (`agent`) | 파이프라인 없음 | 직접 조사하거나, 가능하면 **어댑터를 만들어 파이프라인으로 승격** |
| 지역 랭킹 | `scripts/regional/<cc>.mts` | 자동 파이프라인과 동일 |

## 절차

1. **일괄 갱신**: `npm run data:update -- --jobs 8` (전체 약 수 분). 먼저 확인만 하려면 `--dry`. 특정 랭킹은 id를 인자로.
   - 가드가 있다: 숫자가 깨졌거나, 항목 수가 30% 넘게 줄었거나, 중복이면 **기존 파일을 그대로 두고** `✗`로 보고한다.
   - `✗` 가 나오면 출처 레이아웃이 바뀐 것이다 — 해당 `scripts/sources/*.mts` 어댑터를 고친다 (가드를 풀지 않는다).
2. **신선도 점검**: `npm run data:freshness` (네트워크 없음). 기준 연도 히스토그램, 올해-1년보다 낡은 랭킹을 출처별로 묶어 보여주고, 파이프라인이 갱신하지 못하는 수동/에이전트 랭킹을 나열한다.
   - 낡았다고 모두 문제는 아니다. **인구조사(census)** 는 10년 주기라 2021~2022가 최신일 수 있다. 출처에 새 판이 *있는데* 안 따라오는 것만 조치한다.
3. **낡은 이유 분류** (출처별로 한 번씩 확인):
   - 출처에 새 판이 있고 어댑터가 옛 표/연도를 가리킴 → 어댑터의 URL·표 선택·연도 로직 수정 후 해당 id만 `data:update`.
   - World Bank·OWID 지표 → **최신 연도 우선** 정책: 국가 10개 이상(`MIN_COUNTRIES_FOR_LATEST`)인 가장 최근 연도를 쓴다. 항목 수가 줄어도 최신 연도를 택하며, 연도가 올라가는 갱신에는 "항목 30% 감소" 가드를 적용하지 않는다. 낡았다면 출처에 아직 새 값이 없는 것이다.
   - 출처 자체가 더는 갱신되지 않음 → 대체 출처를 찾는다 (예: OWID, 통계청 직접).
4. **수동/에이전트 랭킹**: 웹에서 같은 지표의 새 판을 찾아 값을 교체한다. 규칙:
   - 값은 **방금 열어 본 페이지에서만** 가져온다. 기억·추정으로 채우지 않는다.
   - 가능하면 HTML/CSV를 `fetch`로 직접 파싱하는 어댑터(`scripts/sources/`)로 만들고 `registry.mts`에 등록 → 다음부터 자동 갱신 (예: `gasoline`은 `globalpetrolprices.mts`, `happiness`는 `owid`).
   - 어댑터가 어려우면 JSON을 직접 수정하되 `source.url`, `year`, `asOf`, `verified`(직접 대조했을 때만 true), `source.note`를 정확히 쓴다. 표본값(“sample values”)은 남기지 않는다.
   - 또는 `ANTHROPIC_API_KEY`가 있으면 `npm run agent -- refresh` 가 오래된 수동/에이전트 랭킹을 모델이 재조사한다.
5. **검증**: `npm run data:validate` → `npm run lint`. 항목 수·1위가 바뀐 랭킹은 `npm run viz:report -- <id>` 로 시각화가 여전히 맞는지 본다 (`ranking-viz` 스킬).
6. **문서**: 수치(랭킹 개수 등)나 구조가 바뀌었으면 `project_plan.md` §6 변경 이력, `srs.md`, `software_architecture.md`를 갱신한다 (CLAUDE.md 규칙).

## 주의

- `year`는 데이터가 설명하는 해, `asOf`는 월 단위 시점. 한 랭킹 안의 모든 행은 같은 해·같은 단위여야 한다.
- 값이 바뀌지 않으면 파일을 건드리지 않는다(`updatedAt`만 바뀌는 diff 방지). 일괄 실행 후 `git diff --stat` 로 의도한 변경인지 확인한다.
- 출처의 라이선스/이용약관을 존중한다. 유료·독점 종합 순위를 통째로 복제하지 않는다.

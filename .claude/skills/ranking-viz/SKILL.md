---
name: ranking-viz
description: 랭킹 페이지 상단 시각화(지도·트리맵·분포 스트립·발산 막대·버블맵·롤리팝)를 랭킹의 성격에 맞게 고르고 검증한다. 랭킹을 추가·수정·삭제하거나, 새 랭킹 JSON/레지스트리/에이전트 결과를 커밋하기 전, 시각화 컴포넌트(src/components/viz, RankingViz, RankingMap)나 src/lib/viz.ts 를 건드릴 때 반드시 사용한다.
---

# ranking-viz — 랭킹마다 알맞은 시각화

랭킹 상세 페이지(`src/app/ranking/[id]/page.tsx`)는 표 위에 `<RankingViz>` 하나를 그린다.
어떤 그림이 나오는지는 `src/lib/viz.ts`의 `pickViz(ranking)`가 **데이터의 성격**(단위·개수·음수 여부·`scope`·`multi`)으로 정한다.
모든 랭킹을 같은 지도로 그리지 않는다 — 숫자가 말하려는 바에 맞는 형태가 다르기 때문이다.

## 언제 쓰나 (매번)

- 랭킹을 **추가·삭제·단위 변경**할 때 (수동 JSON, `registry.mts`/`topics.mts`, 에이전트 `create_ranking` 결과 포함)
- `src/lib/viz.ts`, `src/components/viz/*`, `RankingViz.tsx`, `RankingMap.tsx`, 시각화 CSS(`globals.css`의 `.viz`/`.tm`/`.strip`/`.dv`/`.lp`/`.bubbles`)를 바꿀 때
- 커밋 전: 이번 변경으로 영향받는 랭킹의 시각화가 의도에 맞는지 확인

## 형태 선택 규칙 (pickViz가 하는 일 — 이 표가 곧 코드)

| 데이터 | 형태 | 이유 | 예 |
| --- | --- | --- | --- |
| 값이 0 아래로 내려감 (≥10개) | `diverging` | 0을 기준으로 한 방향성이 핵심. 위·아래 극단만 막대로 | inflation, net-migration |
| `scope` 있음(지역 랭킹), 합산 가능 | `treemap` | 한 나라 안에서의 비중 | 주별 GDP·인구 |
| `scope` 있음, 합산 불가(1인당·점수·순위) | `strip` (한 줄) | 분포와 극단값 | 주별 1인당 GDP |
| `scope` 있고 8개 미만 | `lollipop` | 너무 적어 분포가 의미 없음 | 소규모 지역 목록 |
| `multi` (도시·기업·웹사이트처럼 나라가 중복) | `bubbles` | "어느 나라에 몰려 있나"가 핵심 | largest-companies |
| 15개 미만 | `lollipop` | 짧은 리더보드 | tallest-buildings |
| 합산 가능한 총량(USD billion, tonnes, people…) | `treemap` | 면적 = 세계 합계에서의 비중 | gdp-nominal, population |
| 비율·점유율(`%`, rate) | `map` | 이웃 나라와의 지리적 패턴 | unemployment, internet-users |
| 1인당·점수·지수·연수 등 수준 값 | `strip` | 지역별(대륙) 행으로 나눈 분포 + 중앙값 | life-expectancy, gdp-per-capita |
| 5개 미만 | 없음 | | |

"합산 가능"은 `isAdditive(unit)`: 단위에 billion/million/tonnes/people… 가 있고 `per`·`%`·`rate`·`years`·`index` 등 비율 표지가 없어야 한다
(`per day`·`per year`는 총량의 기간 표기라 무시). 판정이 틀리면 **단위 문자열 규칙(`TOTAL`/`RATIO`)을 고친다** — 같은 예외가 여럿이면 규칙, 한 건이면 `VIZ_OVERRIDES`.

## 절차

1. **랭킹의 성격을 먼저 말로 적는다.** "이 숫자의 요점은 비중 / 지리 패턴 / 분포 / 방향성 / 집중도 / 리더 중 무엇인가?"
2. `npm run viz:report -- <id> [<id>…]` 로 현재 자동 선택을 확인한다 (인자 없이 실행하면 형태별 요약).
3. 자동 선택이 1에서 적은 요점과 다르면:
   - 같은 종류가 여러 개 틀리면 `src/lib/viz.ts`의 규칙(`TOTAL`/`RATIO`/분기)을 고친다.
   - 한 건뿐이면 `VIZ_OVERRIDES`에 `"<id>": "<kind>"`를 추가한다 (이유를 한 줄 주석으로). **JSON 파일에는 쓰지 않는다** — `npm run data:update`가 파일을 다시 쓰기 때문.
4. 새 형태가 필요하면(위 6개로 안 되는 경우) 아래 "새 형태 추가"를 따른다.
5. 눈으로 확인한다 (아래 "검증").
6. `npm run lint`, `npm run data:validate`. 문서(`srs.md`, `software_architecture.md`, `project_plan.md`)는 CLAUDE.md 규칙대로 커밋 때 갱신.

## 디자인 규칙 (dataviz 스킬 요약 — 차트 코드를 쓰기 전 `dataviz` 스킬을 읽는다)

- 색은 **한 가지 데이터 색(`--bar`) + 중립 회색**. 음수만 `--neg`(파랑)로, 양/음 두 색만 쓴다. 범주 색을 3개 넘게 쓰지 않는다 — 대륙 구분 같은 건 색이 아니라 **행(facet)** 으로 나눈다 (`Strip`).
- 순위 음영은 `s0`~`s4` 클래스(`--c` 혼합 비율)를 재사용한다. 지도·트리맵이 같은 규칙.
- **텍스트는 SVG가 아니라 HTML**로 그린다 (모바일에서 viewBox가 줄어 글자가 깨짐). 도형만 SVG(지도·버블), 나머지는 퍼센트 좌표의 HTML.
- 모든 마크에 `title`(이름·값·순위)을 달고, 세계 랭킹이면 `/country/<code>`로 링크(`prefetch={false}`). 컨테이너에 `role="img"` + 요약 `aria-label`.
- 다크 모드는 CSS 변수(`--on-bar`, `--neg`, `--surface`…)로 처리. 색을 하드코딩하지 않는다.
- 범례/캡션(`.viz-cap`)에 **무엇이 무엇을 인코딩하는지**(면적=비중, 로그 눈금 등)를 반드시 쓴다.
- 시각화는 표를 대체하지 않는다. 표는 항상 아래에 있다.

## 새 형태 추가

1. `VizKind`/`VIZ_KINDS`/`VIZ_LABEL`(`src/lib/viz.ts`)에 추가하고 `pickViz`에 분기를 넣는다.
2. `src/components/viz/<Name>.tsx` (서버 컴포넌트, 데이터가 모자라면 `null` 반환) + `RankingViz.tsx`의 `switch`에 연결.
3. CSS는 `globals.css`의 "Ranking visualizations" 블록에 추가 (모바일 `@media (max-width: 640px)` 포함).
4. 이 파일의 규칙 표를 갱신한다.

## 검증

```bash
npm run dev                       # 포트 3100
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars \
  --window-size=1100,900 --screenshot=<scratchpad>/x.png http://localhost:3100/ranking/<id>
```

스크린샷을 Read로 열어 확인한다: 글자 잘림·겹침, 라벨, 범례/캡션, 다크 모드 대비, 빈 공간. 형태가 바뀌었다면 대표 랭킹 1~2개씩(세계 + 지역)을 본다.
(헤드리스 Chrome은 최소 창 너비가 있어 390px 스크린샷은 오른쪽이 잘려 보인다 — 코드 문제가 아님.)

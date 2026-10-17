---
name: ranking-viz
description: 랭킹 페이지 상단 시각화(지도·트리맵·대륙별 막대·버블·와플·분포 스트립·히스토그램·산점도·발산 막대·버블맵·포디움·방사형 리더보드)를 랭킹의 성격에 맞게 고르고 검증한다. 랭킹을 추가·수정·삭제하거나, 새 랭킹 JSON/레지스트리/에이전트 결과를 커밋하기 전, 시각화 컴포넌트(src/components/viz, RankingViz, RankingMap)나 src/lib/viz.ts 를 건드릴 때 반드시 사용한다.
---

# ranking-viz — 랭킹마다 알맞은 시각화

랭킹 상세 페이지(`src/app/ranking/[id]/page.tsx`)는 표 위에 `<RankingViz>` 하나를 그린다.
어떤 그림이 나오는지는 `src/lib/viz.ts`의 `pickViz(ranking)`가 **데이터의 성격**(단위·개수·음수 여부·`scope`·`multi`)으로 정한다.
모든 랭킹을 같은 지도로 그리지 않는다 — 숫자가 말하려는 바에 맞는 형태가 다르기 때문이다.

## 언제 쓰나 (매번)

- 랭킹을 **추가·삭제·단위 변경**할 때 (수동 JSON, `registry.mts`/`topics.mts`, 에이전트 `create_ranking` 결과 포함)
- `src/lib/viz.ts`, `src/components/viz/*`, `RankingViz.tsx`, `RankingMap.tsx`, 시각화 CSS(`globals.css`의 `.viz`/`.tm`/`.strip`/`.dv`/`.lp`/`.bubbles`)를 바꿀 때
- 커밋 전: 이번 변경으로 영향받는 랭킹의 시각화가 의도에 맞는지 확인

## 형태 선택 규칙 (pickViz가 하는 일 — 이 표가 곧 코드, 위에서 아래로 처음 맞는 것)

| 순서 | 데이터 | 형태 | 이유 | 예 |
| --- | --- | --- | --- | --- |
| 1 | `VIZ_OVERRIDES`에 id가 있음 | 지정값 | 규칙으로 못 잡는 예외 | – |
| 2 | 5개 미만 | 없음 | | |
| 3 | `VIZ_PAIRS`에 id가 있음 (세계) | `scatter` | 관련 있는 두 랭킹을 한 화면에 — 관계와 예외 국가가 보임 | life-expectancy ↔ gdp-per-capita |
| 4 | 값이 0 아래로 내려감 (≥10개) | `diverging` | 0 기준 방향성. 위·아래 극단 7개씩 | inflation, net-migration |
| 5 | `scope`(지역 랭킹): 8개 미만 | 없음 | 비교할 항목이 너무 적음 | |
| 5 | `scope`, 합산 불가(1인당·점수·순위) | `strip`(한 줄) | 분포와 극단값 | 주별 1인당 GDP |
| 5 | `scope`, 합산 가능, 25개 미만 / 이상 | `packed` / `treemap` | 한 나라 안에서의 비중 | 주별 인구·GDP |
| 6 | `multi` (도시·기업·웹사이트처럼 나라 중복) | `bubbles` | "어느 나라에 몰려 있나" | largest-companies |
| 7 | 15개 미만, 1위가 2위의 1.5배 이상 (Rank 단위 제외) | `podium` | 압도적 1위는 큰 숫자 카드로 | lithium-production |
| 7 | 15개 미만, 그 외 | `radial` | 짧은 리더보드의 값을 원형으로 비교 | |
| 8 | 합산 가능, 상위 3개가 65% 이상 | `waffle` | "몇 곳이 대부분을 갖는다"가 요점 | coal-production |
| 8 | 합산 가능, 30개 미만 | `packed` | 면적으로 크기 비교 | data-centers |
| 8 | 합산 가능, 금액(USD 등) | `treemap` | 면적 = 비중 | gdp-nominal |
| 8 | 합산 가능, 금액 아님(톤·명·TWh…) | `regions` | 대륙별 100% 막대 + 대륙별 상위 3 | co2-emissions |
| 9 | "per 1,000 / 100,000 / million / woman" 비율 | `histogram` | 구간별 분포 | birth-rate, homicide-rate |
| 9 | `%`·rate 비율·점유율 | `map` | 이웃 나라와의 지리적 패턴 | unemployment |
| 9 | 그 밖의 수준 값(1인당·점수·지수·연수) | `strip` | 대륙별 행으로 나눈 분포 + 중앙값 | gdp-per-capita |
| 예외 | 값의 범위가 여러 자릿수이고 아래 표가 이미 막대를 사용함 | `dots` | 로그 축 점 분포로 표와 다른 방식으로 전체 분포를 보여줌 | us-highest-paid-ceos |

"합산 가능"은 `isAdditive(unit)`: 단위에 billion/million/tonnes/people… 가 있고 `per`·`%`·`rate`·`years`·`index` 등 비율 표지가 없어야 한다
(`per day`·`per year`는 총량의 기간 표기라 무시). 판정이 틀리면 **단위 문자열 규칙(`TOTAL`/`RATIO`/`MONEY`/`PER_THOUSAND`)을 고친다** — 같은 예외가 여럿이면 규칙, 한 건이면 `VIZ_OVERRIDES`.
`scatter` 짝은 `VIZ_PAIRS`(id → x축 랭킹 id)에만 손으로 등록하며 **현재 비어 있다**. 랭킹 페이지는 그 랭킹 자신의 값을 그려야 하므로(인터넷 이용률 페이지에 GDP 축이 나오면 주제에서 벗어난다) 사용자가 요청하지 않는 한 쌍을 추가하지 않는다. 등록했다면 짝 랭킹이 사라질 때 그림도 사라지니 함께 확인한다.

## 절차

1. **랭킹의 성격을 먼저 말로 적는다.** "이 숫자의 요점은 비중 / 지리 패턴 / 분포 / 방향성 / 집중도 / 리더 중 무엇인가?"
2. `npm run viz:report -- <id> [<id>…]` 로 현재 자동 선택을 확인한다 (인자 없이 실행하면 형태별 요약).
3. 자동 선택이 1에서 적은 요점과 다르면:
   - 같은 종류가 여러 개 틀리면 `src/lib/viz.ts`의 규칙(`TOTAL`/`RATIO`/분기)을 고친다.
   - 한 건뿐이면 `VIZ_OVERRIDES`에 `"<id>": "<kind>"`를 추가한다 (이유를 한 줄 주석으로). **JSON 파일에는 쓰지 않는다** — `npm run data:update`가 파일을 다시 쓰기 때문.
4. 새 형태가 필요하면(위 12개로 안 되는 경우) 아래 "새 형태 추가"를 따른다.
5. 눈으로 확인한다 (아래 "검증").
6. `npm run lint`, `npm run data:validate`. 문서(`srs.md`, `software_architecture.md`, `project_plan.md`)는 CLAUDE.md 규칙대로 커밋 때 갱신.

## 디자인 규칙 (dataviz 스킬 요약 — 차트 코드를 쓰기 전 `dataviz` 스킬을 읽는다)

- 색은 기본적으로 **한 가지 데이터 색(`--bar`) + 중립 회색**. 음수만 `--neg`(파랑). 점·원처럼 모든 쌍이 맞닿는 형태에서는 범주 색을 3개 넘게 쓰지 않는다 — 대륙 구분은 색이 아니라 **행(facet)** 으로 나눈다 (`Strip`).
- 범주 색이 꼭 필요한 건 `Regions`의 누적 막대뿐이다 (인접 쌍 형태). 대륙마다 고정 색 `--c1`~`--c5`(순서: Asia, Americas, Europe, Africa, Oceania — 순위가 아니라 대상에 색을 붙인다)를 쓰고, 막대에 직접 라벨 + 범례 목록을 함께 둔다. 이 팔레트는 dataviz 스킬의 `validate_palette.js`로 검증했다(밝은 모드 대비 경고는 직접 라벨로 보완). 팔레트를 바꾸면 라이트·다크 모두 다시 돌린다.
- 참고한 형태 목록(Visual Capitalist 등 순위·트리맵·버블·Sankey·지도 계열)은 형식만 참고한다. 그래픽을 복제하지 않는다. 사이트 본문은 403으로 읽을 수 없으니 검색 결과 수준의 정보만 근거로 삼는다.
- 순위 음영은 `s0`~`s4` 클래스(`--c` 혼합 비율)를 재사용한다. 지도·트리맵이 같은 규칙.
- **텍스트는 SVG가 아니라 HTML**로 그린다 (모바일에서 viewBox가 줄어 글자가 깨짐). 도형만 SVG(지도·버블), 나머지는 퍼센트 좌표의 HTML.
- 모든 마크에 즉시 툴팁(`data-tip`, 이름·값·순위)을 달고, 세계 랭킹이면 `/country/<code>`로 링크(`prefetch={false}`). 컨테이너에 `role="img"` + 요약 `aria-label`.
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

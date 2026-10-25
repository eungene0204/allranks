# 초안 4개 검증 및 공개 반영 — 2026-10-23

## 결과

| ID | 결정 | 원문 대조와 처리 |
|---|---|---|
| `data-centers` | 공개 | Mappr의 2025 상위 25개 표에서 모든 이름·값·순서를 대조했고 Straits Research 표의 상위권을 교차 확인했다. 지도 디렉터리의 등록 시설 수이므로 용량·전력량과 구별한다. Stanford HAI AI Index 2026은 Cloudscene의 2025 미국 수를 5,427개로 제시해 Mappr의 5,426개와 1개 차이가 있다. 페이지에는 Mappr가 인용한 2025년 3월 표의 수치를 유지하고 차이를 명시했다.
| `math-scores` | 공개 | 40개 시스템의 명칭·반올림 평균 점수·점수 순서를 2026년 9월 발표 Visual Capitalist 표와 대조했다. OECD 보고서는 중국 B-S-J-Z 612점, 싱가포르 563점, OECD 평균 463점을 확인한다. OECD FAQ는 표본 오차 때문에 정확한 서수 순위를 단정할 수 없다고 안내하므로 제목과 본문을 평균 점수 순서로 고치고, 점수가 같은 항목은 공동 순위로 표시한다. 중국 표본은 베이징·상하이·장쑤·저장에 한정한다.
| `qs-universities` | 공개 | QS 공식 2027 순위의 상위 10개 학교·국가·순서·동점 위치를 확인했다. Imperial College London/Stanford는 공동 2위, ETH Zurich/UCL은 공동 8위다. 기존 데이터에서 잘못 갈라 둔 순위를 동점으로 수정하고 QS 점수를 새로 만들지 않았다.
| `refrigerators` | 공개 | Consumer Reports의 허가된 2025 재인쇄본에서 프렌치도어 냉장고 브랜드 점수와 순서를 확인했다. 기존에 출처가 뒷받침하지 않던 다섯 브랜드/순서를 제거하고 LG 75, GE/Haier 공동 74, Bosch 73, Whirlpool 70으로 교체했다. 점수는 시험·회원 설문·제품군 폭을 반영하며 개별 모델 추천이나 신뢰도만의 점수가 아님을 설명에 기록했다.

## 사이트 반영

네 파일 모두 `source.verified: true`로 기록되어 기존 `src/lib/data.ts` 공개 필터를 통해 목록·검색·사이트맵·상세 페이지에 노출된다. `src/lib/format.ts`는 같은 값의 항목을 공동 순위(예: 2, 2, 4)로 표시하도록 바꿨다. 검증은 링크된 자료의 원자료 대조이며 제품을 직접 시험했거나 PISA 성취도를 독립 평가했다는 주장은 하지 않는다.

## 출처

- [Mappr — Data Centers by Country (2025)](https://www.mappr.co/countries-with-most-data-centers/)
- [Straits Research — Data Centers (March 2025)](https://straitsresearch.com/statistic/countries-with-the-most-data-centers)
- [Stanford HAI — AI Index Report 2026](https://hai.stanford.edu/assets/files/ai_index_report_2026.pdf)
- [OECD — PISA 2025 Results, Volume I](https://www.oecd.org/en/publications/pisa-2025-results-volume-i_73451bc5-en/full-report/student-performance-in-pisa-2025_23e075c2.html)
- [OECD — PISA FAQ](https://www.oecd.org/en/about/programmes/pisa/pisa-frequently-asked-questions-faqs.html)
- [Visual Capitalist — PISA mathematics scores](https://www.visualcapitalist.com/worlds-best-countries-at-math-in-2026/)
- [QS — World University Rankings 2027](https://www.topuniversities.com/qs-top-uni-wur)
- [Consumer Reports — Best Refrigerator Brands of 2025, licensed reprint](https://reprints.theygsgroup.com/cr/reprints/BestRefrigeratorBrands_2025.pdf)
- [Consumer Reports — refrigerator buying guide](https://www.consumerreports.org/cro/refrigerators/buying-guide/index.htm)

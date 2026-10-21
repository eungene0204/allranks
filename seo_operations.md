# SEO 운영 및 측정

## 구현된 공개 정책

- 검색 URL은 사용자 결정대로 index/follow 및 robots 허용. 쿼리 앞뒤 공백과 페이지 번호를 정규화하며 query/page에 맞는 canonical을 생성한다. 임의 검색 URL의 실제 색인 여부는 검색엔진이 결정한다.
- 랭킹은 필터 전 전체 행을 HTML table로 제공한다. 국가·분류는 48개 단위 서버 렌더링과 실제 이전/다음 링크를 제공하고 각 페이지에 자체 canonical을 부여한다.
- 랭킹의 Dataset은 외부 원출처를 isBasedOn/citation으로 연결한다. AllRanks는 집계 페이지의 publisher이며 원자료 creator를 자칭하지 않는다. 통계 라이선스의 텍스트를 임의의 스키마 URL로 바꾸지 않는다.
- source.verified=false 및 명시적으로 검증되지 않은 manual/agent 데이터는 목록·상세·사이트맵·SEO 날짜 매니페스트에서 제외한다.
- /llms.txt는 도구용 선택 안내이며 Google 노출 요건이 아니다. 블로그·FAQ·검색어 변형 페이지는 근거 없이 대량 생성하지 않는다.

## 배포 시 확인

1. npm run build (데이터 검사, SEO 스냅샷 갱신, 타입 검사 포함).
2. 로컬 서버에서 npm run seo:check -- http://localhost:3200.
3. 운영 배포 후 npm run seo:check -- https://allranks.world로 동일 검증.
4. snapshot 날짜를 직접 현재 날짜로 덮어쓰지 않는다. 해시에는 updatedAt을 제외한 공개 랭킹 내용이 반영된다. 동일 내용을 반복 수집하거나 재빌드하면 날짜는 유지된다. 최초 매니페스트 날짜는 최초 관측·게시일이고 원자료 기준연도와 다르다.

## 계정이 필요한 확인

연결된 관리 API는 없지만 2026-10-21 Safari의 로그인된 계정으로 Google Search Console 접근과 도메인 속성을 확인하고 RSS 제출에 성공했다(Success, 발견 URL 51개). Bing도 사이트 추가·HTML 메타 태그 소유 확인 후 RSS 제출에 성공했다(접수 완료, Processing). 네이버 등록·실제 색인·검색 실적 확인은 미완료다. 각 서비스가 발급한 소유 확인 값을 환경변수로 설정할 수 있는 메타 태그를 지원한다.

- Google Search Console: 소유 확인 후 /sitemap.xml 제출, 대표 랭킹·국가·검색 URL 실시간 검사, Google이 선택한 canonical 확인.
- Bing Webmaster Tools: 소유 확인 및 사이트맵 제출. 실제 Bing 색인 현황 확인.
- 네이버: 한국 검색을 운영 채널로 삼을 경우 소유 확인·사이트맵 제출·수집 상태 확인. 영문 콘텐츠를 한국어라고 표시하지 않는다.
- IndexNow는 발급·호스팅한 실제 키가 있을 때 추가 연동한다. 확인되지 않은 키를 만들었다고 가정하거나 성공한 것으로 기록하지 않는다.

## 재측정

2026-10-21 기술 기준선은 seo_audit_2026-10-21.md에 있다. 첫 재측정 권장일은 2026-11-04이며 실제 개선 배포일이 다르면 배포+14일로 조정한다. 자동 일정 등록은 하지 않았다.

- GSC 최근 28일 노출·클릭·CTR·평균순위: 랭킹/국가/분류/검색으로 구분하고 최근 2~3일 집계 지연 제외.
- 색인 제외 원인과 선택된 canonical, Bing·네이버 수집 상태.
- AI 인용 고정 질문: “2026 QS university rankings top university”, “countries by nominal GDP”, “India world GDP rank”, “countries with lowest gasoline prices”, “world busiest container ports latest ranking”. 해당 출처의 실제 기준연도와 일치하는지 먼저 확인하고 동일 질문으로 ChatGPT 검색·Perplexity·네이버 출처 포함 여부와 측정일 기록. 인용 결과는 아직 미측정이다.
- Core Web Vitals는 CrUX/현장 지표 또는 PageSpeed로 별도 측정한다. HTML 전송량 감소를 LCP 개선 측정값으로 바꾸어 기록하지 않는다.
- 검색어 백로그는 실제 검색어별 노출·순위 확인 후 채운다. 실측 없이 검색 수요·노출 0·CTR 수치를 만들어내지 않는다.

## 이번 배포 검증 결과

2026-10-21 https://allranks.world 운영 배포 후 HTTP 검사 25개와 공유 PNG 검사가 통과했다. 검색 index/follow, 랭킹 135개 전체 HTML 행, 사이트맵 3,577 URL 및 lastmod 3,326개, 미검증 9개 상세 404를 확인했다. 증빙은 reports/seo-verification-2026-10-21.json에 있다. PageSpeed 공개 API는 HTTP 429로 측정하지 못했다. GitHub CI 파일은 커밋·푸시 전이며 운영 사이트는 Vercel에 직접 배포했다.

## RSS 구독 운영

/feed.xml은 최근 관측된 공개 랭킹 스냅샷 최대 50개를 RSS 2.0으로 제공한다. 원자료 발행일과 기준기간을 구독 항목의 관측일과 구분한다. 새 랭킹·내용 변경은 다음 데이터 빌드 및 배포에서 반영되며, timestamp-only 재수집은 기존 콘텐츠 해시와 GUID를 유지한다. 초기 50개는 최초 관측일이 같을 수 있고 ID로 정렬된다. 피드는 전체 변경 이력 보관소가 아니다.

첫 후속 점검 권장일은 2026-11-04이다. HTTP 200과 application/rss+xml, XML 파싱, 실제 갱신 이후 GUID·pubDate 변경, 동일 내용 재수집 이후 GUID 유지, 비공개 초안 제외를 확인한다. 구독·클릭 수는 계측 도구가 없으므로 현재 미측정이다.

## RSS 검색엔진 제출 결과 — 2026-10-21

| 검색엔진 | 제출 URL | 확인한 상태 |
|---|---|---|
| Google Search Console | https://allranks.world/feed.xml | sc-domain:allranks.world, RSS, Success, 발견 URL 51개 |
| Bing Webmaster Tools | https://allranks.world/feed.xml | 사이트 소유 확인 성공 후 제출 성공 메시지, Processing |

Bing은 신규 사이트로 등록했고 공개 소유 확인 태그는 Vercel Production의 NEXT_PUBLIC_BING_SITE_VERIFICATION 환경변수로 유지한다. 환경변수 반영 배포 후 curl로 운영 메타 태그를 직접 확인했다. Google의 발견 URL 51개는 이 피드 보고서 수치이며 전체 사이트의 색인 수가 아니다. Bing 처리 완료·색인·실제 AI 인용은 아직 미확인이다. 네이버에는 이번 요청에서 제출하지 않았다.

Bing 처리 상태는 2026-10-22 이후 확인하고, 2026-11-04에 노출·클릭·인용을 재측정한다. 자동 일정 등록이나 리마인더 생성은 하지 않았다.

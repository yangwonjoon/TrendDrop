# TrendDrop TikTok API Research

작성일: 2026-07-06

## 목적

TrendDrop에서 활용 가능한 TikTok 계열 API를 조사하고, 한국 영리 스타트업 입장에서 무엇이 실제로 접근 가능한지, 트렌드 신호(트렌딩 해시태그/키워드)를 어떤 경로로 얻을 수 있는지, 비용과 리스크는 어떤지 정리한다.

이 문서는 아래 질문에 답하는 것을 목표로 한다.

- TikTok이 제공하는 공식 API 중 트렌드 데이터를 주는 것이 있는가
- 한국의 영리 기업이 실제로 승인받을 수 있는 경로는 무엇인가
- 공식 경로가 막힐 경우 서드파티 대안의 비용과 리스크는 어떤가
- 법적/약관 리스크는 어떻게 평가해야 하는가

조사 방법: 공식 문서(developers.tiktok.com, ads.tiktok.com, business-api.tiktok.com), TikTok 공식 GitHub SDK 소스, 실제 엔드포인트 호출 테스트(2026-07-06), 서드파티 업체 공식 페이지를 교차 검증했다. 검증하지 못한 항목은 각 섹션과 문서 말미에 명시했다.

## 한눈에 보는 결론

### 핵심 판단

- developers.tiktok.com 계열 공식 API(Research/Display/Commercial Content/Content Posting)는 **전부 TrendDrop 용도로 사용 불가** — Research API는 미국·유럽 학술기관 전용에 상업적 사용이 명시적으로 금지되어 있고, 나머지는 트렌드 데이터를 아예 제공하지 않는다
- **유일하게 유효한 공식 경로는 TikTok Marketing API(business-api.tiktok.com)의 Discovery 엔드포인트** — `GET /discovery/trending_list/`가 국가별×카테고리별 트렌딩 해시태그(일별 순위/조회수 시계열 포함)를 제공한다. TikTok 공식 GitHub SDK 소스에서 스펙을 직접 확인했다
- Creative Center(광고주용 트렌드 대시보드)는 2025~2026년 사이 대폭 개편되어 **해시태그 트렌드만 남고 노래/크리에이터/비디오 트렌드는 제거**됐으며, 익명 백엔드 접근도 차단됐다(직접 테스트로 확인). 스크래핑은 이제 로그인 쿠키 기반만 가능한 고위험 경로다
- **oEmbed 엔드포인트는 무료·공개·공식** — 트렌드 발견은 못 하지만 트렌드 예시 영상을 웹앱에 합법적으로 임베드하는 데 가장 안전한 수단이다 (D6 관련 콘텐츠 묶음에 직결)
- 서드파티 API는 과금 모델을 잘못 고르면 비용이 폭증한다 — 키워드 전수 폴링 + 결과당 과금 조합은 월 수천 달러, 요청당 과금 또는 트렌드 차트 저빈도 수집은 월 $100~350 수준

### 바로 검토할 가치가 큰 것

1. TikTok Marketing API — Discovery (`/discovery/trending_list/`, `/discovery/detail/`)
2. TikTok oEmbed (임베드 전용)

### 보조/플랜 B

1. Apify 등 Creative Center 트렌드 스크레이퍼 (로그인 쿠키 필요, 중~고위험)
2. ScrapTik / EnsembleData 등 키워드 상세 지표 보강용

### 제외

1. TikTok Research API (자격 원천 불가)
2. Display API / Content Posting API / Commercial Content API (트렌드 데이터 없음)
3. 오픈소스 직접 스크래핑의 상용 기반 사용 (파손 리스크 최대)

## 가장 먼저 알아둘 점: 공식 API 지형

TikTok의 개발자 표면은 두 갈래다.

- `developers.tiktok.com` — 일반 개발자용 (Research, Display, Content Posting, Commercial Content, oEmbed)
- `business-api.tiktok.com` — 광고주/비즈니스용 (Marketing API, Organic/Discovery API)

트렌드 신호는 **비즈니스 쪽에만** 있다. 일반 개발자 쪽에서 트렌드에 가장 근접한 Research API는 한국 영리 기업이 쓸 수 없다. 이 구조를 이해하면 조사 결과 전체가 명확해진다.

## API별 조사

## 1. TikTok Marketing API — Discovery 엔드포인트 (1순위 후보)

공식 자료:

- https://business-api.tiktok.com/portal
- https://github.com/tiktok/tiktok-business-api-sdk (공식 SDK — `discovery_trending_list.yml`, `discovery_detail.yml`에서 스펙 직접 확인)
- https://business-api.tiktok.com/portal/docs/get-details-of-a-popular-hashtag/v1.3
- https://ads.tiktok.com/help/article/marketing-api?lang=en

무엇을 할 수 있나:

### `GET /discovery/trending_list/` (v1.3)

- `discovery_type`: 현재 enum은 `HASHTAG` 하나뿐 (노래/크리에이터는 공식 API에도 없음)
- `country_code`: 국가 지정 (기본 US)
- `category_name`: 약 80개 콘텐츠 카테고리 enum — `BEAUTY`, `BEAUTY_AND_PERSONAL_CARE`, `APPAREL_AND_ACCESSORIES`, `OUTFITS`, `FOOD`, `COOKING`, `DRINKS`, `TRAVEL`, `TECHNOLOGY`, `GADGETS_AND_INNOVATION`, `DIARY_AND_VLOG`, `HOME_AND_GARDEN` 등
- `date_range`: `1DAY` / `7DAY`(기본) / `30DAY` / `120DAY`
- 응답: `hashtag_name`, `posts`, `views`, `rank_position`, `rank_change`, `top_country_list`, `trending_history[]`(날짜별 순위·조회수)

### `GET /discovery/detail/`

- 해시태그 상세: `audience_insights`, `trending_history[]`, `top_country_list` 등

TrendDrop에서의 활용:

- `country_code=KR` + 카테고리 enum이 TrendDrop의 뷰티/패션/푸드/여행/라이프스타일/테크와 거의 1:1 매핑됨
- `trending_history`(일별 순위/조회수)와 `rank_change`는 **D2(급상승 산식)의 실데이터 원료** — 하드코딩된 `+182%`를 설명 가능한 실값으로 대체 가능
- `audience_insights`, 시계열은 **D3(왜 뜨나) 설명 생성의 근거 데이터**로 사용 가능

자격 요건:

- TikTok for Business 계정 + 개발자 앱 등록·승인 + 광고주 계정(`advertiser_id`) + Access Token
- 한국 사업자 등록 가능. API 사용료 없음(광고 집행비 별도)
- 광고 집행 없이도 광고주 계정 생성 자체는 가능

한계 및 미검증 항목:

- 문서 포털이 로그인/JS 렌더링 뒤에 있어 **country_code 지원 국가에 KR 포함 여부를 문서로 확정 못 함** (Creative Center UI 국가 목록에는 KR이 있어 지원 가능성 높음)
- 이 엔드포인트에 **별도 권한 심사가 있는지, 레이트리밋 수치가 얼마인지 미검증** — 앱 등록 후 실호출로 확인 필요
- 해시태그만 제공. 키워드(일반 검색어) 단위 트렌드는 없음

판정: **유일한 공식 트렌드 경로. 개발자 등록 → 실호출 검증이 최우선 액션 아이템.**

## 2. TikTok Research API

공식 문서:

- https://developers.tiktok.com/products/research-api/
- https://developers.tiktok.com/doc/research-api-faq

무엇을 할 수 있나:

- 공개 영상/댓글/계정 쿼리. `region_code`, `hashtag_name`, `keyword`, `view_count` 필터 — 데이터 자체는 TrendDrop에 가장 적합
- 쿼터: 1,000 requests/일, 100,000 records/일. 무료

결정적 한계:

- 자격: **미국·EEA·영국·스위스 학술기관 연구자, EU 비영리 연구기관 등으로 한정**
- FAQ 명시: *"I am a creator, advertiser, or commercial user. Am I eligible? — No."* → **상업적 사용 원천 금지**
- 트렌딩 차트 엔드포인트 없음 (인기순 정렬도 미지원, 조회 윈도우 최대 30일)

판정: **한국 영리 스타트업은 지역 요건과 상업 금지 조항 모두에 걸림. 제외.**

## 3. Creative Center (트렌드 대시보드) — 현황과 스크래핑 리스크

공식 페이지:

- https://ads.tiktok.com/creative/creativeCenter/trends/hashtag (현행)
- https://ads.tiktok.com/help/article/trend-discovery

2025~2026 개편 사항 (직접 확인):

- 기존 Trend Discovery URL들이 **"TikTok One Creative Suite"**로 리디렉트됨
- **유지**: 트렌딩 해시태그, 해시태그 분석(트렌드 곡선/오디언스/연관 영상), Top Ads
- **제거**: 노래/크리에이터/비디오/키워드 인사이트 트렌드
- 국가 필터 27개국에 **한국(KR) 포함**. 산업 필터 15종(Beauty & Personal Care, Apparel & Accessories, Food & Beverage, Travel, Tech & Electronics 등) — TrendDrop 카테고리와 매핑 가능
- 기간 필터: 7/30/90일로 변경

프로그래매틱 접근 현황:

- 과거 널리 쓰이던 익명 백엔드 API(`creative_radar_api`)는 **2026-07-06 직접 테스트 결과 `40101 no permission`으로 차단됨**
- 현재 스크레이퍼들은 로그인 쿠키 기반으로만 동작. 비공개 레이트리밋 때문에 다계정 쿠키 풀 로테이션이 권장되는 상황
- 1년 사이 익명 차단, URL 전면 개편, 기간 옵션 변경, 응답 스키마 변경, 트렌드 표면 제거가 전부 실제로 발생 — **파이프라인이 수시로 깨지는 고위험 경로**

판정: **수동 리서치/에디터 워크플로우용으로는 무료로 유용. 자동화 수집 기반으로는 비권장 (플랜 B 이하).**

## 4. TikTok oEmbed

공식 문서:

- https://developers.tiktok.com/doc/embed-videos

무엇을 할 수 있나:

- `https://www.tiktok.com/oembed?url=<영상 URL>` — **인증 불필요, 무료, 공식**
- 임베드 HTML, 영상 설명, 작성자, 썸네일 반환. 표준 oEmbed 규격

TrendDrop에서의 활용:

- 트렌드 "발견"은 불가. 그러나 다른 경로로 파악한 트렌드의 **대표 영상을 합법적으로 임베드**하는 최선의 수단
- D6(관련 콘텐츠/출처 묶음)에 바로 사용 가능 — 키/승인 없이 즉시 구현 가능

한계:

- 공식 레이트리밋 명시 없음(실무상 IP 기반 비공식 제한 보고 있음 — 미검증). 서버에서 결과를 캐시하면 문제없는 수준

판정: **임베드 용도로 채택 권장. 구현 비용 거의 0.**

## 5. 나머지 공식 API (전부 트렌드 무관)

- **Display API**: OAuth 로그인한 사용자 **본인의** 프로필/영상만 조회 (600 req/분). 플랫폼 전체 트렌드 접근 불가 → 제외
- **Content Posting API**: 쓰기 전용(영상 게시). 감사(audit) 통과 전엔 게시물이 전부 비공개 처리 → 무관
- **Commercial Content API**: EU 광고 투명성 아카이브. 신청은 한국에서도 가능(약 2영업일)하지만 데이터가 유럽 광고뿐 → 한국 트렌드와 무관, 제외

## 6. 서드파티 API 비교

법적 리스크 프레이밍(법률 자문 아님): 미국 판례(hiQ v. LinkedIn)상 공개 데이터 자동 수집의 형사(CFAA) 리스크는 낮아졌지만 **ToS 계약 위반 등 민사 리스크는 유효**하다(hiQ도 최종적으로 계약 위반 청구에서 패소). TikTok의 집행은 소송보다는 기술적 차단(서명 헤더, 디바이스 신뢰 점수, ML 탐지) 강화 중심. hiQ는 미국 판례이며 한국 법제(정보통신망법·부정경쟁방지법 등) 평가는 별개이므로 상용화 전 국내 법률 검토를 권장한다.

리스크 서열(낮음→높음): 공식 API < 공개 페이지 스크래핑 < 로그인 쿠키 기반 Creative Center 스크래핑 ≈ 비공식 모바일 API 에뮬레이션 < 계정 인증 액션 자동화

| 제공업체 | 트렌드 데이터 범위 | 가격 (2026-07 확인) | 리스크 |
|---|---|---|---|
| **Apify** (doliz Creative Center 액터) | 트렌딩 해시태그 + 해시태그 분석 + Top Ads, **KR 지원 명시** | $0.002/item, 성공률 96% | 중상 (사용자 본인 로그인 쿠키 필요) |
| **Apify** (clockworks 일반 액터) | 해시태그/키워드 검색, 영상 메타, 댓글 | 결과 1,000건당 $1.70 | 중하 (공개 웹) — 단 고빈도 폴링 시 비용 폭증 |
| **ScrapTik** (RapidAPI) | 트렌드·검색 포함 18개 엔드포인트 | 요청당 ~$0.002 (플랜 세부 미확인) | 중상 (모바일 API 래퍼) |
| **TokAPI** (RapidAPI) | 트렌딩 피드 + 카테고리, region 파라미터 | 미확인 | 중상 |
| **EnsembleData** | 해시태그/키워드 검색 (트렌딩 피드·지역 필터 없음) | $100~1,400/월 (일일 유닛제) | 중 |
| **TikAPI** | explore(트렌딩) 피드, country 코드 지정 | $29/$79/$189/월 | 중상 + **다운타임 이력 보고** |
| **Bright Data** | 프로필/게시물 스크레이퍼 | 레코드 1,000건당 $1 | 하~중 (컴플라이언스 우수, 소규모엔 과함) |
| **davidteather/TikTok-Api** (오픈소스) | 트렌딩/해시태그 (읽기 전용) | 무료 (프록시 별도) | **상** — 봇 탐지로 파손 빈발, 상용 기반 부적합 (프로토타입 검증용으로만) |

### 비용 시뮬레이션 (6 카테고리 × 20 키워드, 30~60분 주기)

- 키워드 **전수 폴링** + 결과당 과금(Apify 일반/Bright Data): **월 ~$1,700~5,900** ⚠️
- 키워드 전수 폴링 + 요청당 과금(ScrapTik/Lamatok): 월 ~$86~346
- **트렌드 차트 저빈도 수집**(Creative Center 계열, KR 트렌딩 해시태그 100건 × 일 수회): **월 ~$120~250** ✅

핵심: TrendDrop의 목적이 "카테고리별 트렌드 키워드"라면 키워드 전수 폴링이 아니라 **트렌드 차트 자체를 저빈도 수집**하는 아키텍처가 비용도 리스크도 훨씬 낮다. 공식 Discovery API를 쓰면 이 구조가 그대로 성립한다.

## TrendDrop에 추천하는 조합

### 1순위

- TikTok Marketing API — `GET /discovery/trending_list/` (country_code=KR, 카테고리별, date_range=7DAY)

이유:

- 유일한 공식 트렌드 경로. 카테고리 enum이 제품 요구와 정합하고, `trending_history`가 급상승 산식(D2)과 설명 레이어(D3)의 실데이터 원료가 됨

### 2순위

- TikTok oEmbed

이유:

- 트렌드 대표 영상 임베드(D6)를 키·승인 없이 즉시 구현 가능

### 플랜 B (1순위 승인 실패 시)

- Apify Creative Center 액터(doliz) 또는 ScrapTik — 단 로그인 쿠키/비공식 API 리스크를 감수해야 하며, 벤더 중개로 유지보수 부담만 이전됨

### 제외

- Research API, Display API, Commercial Content API, Content Posting API
- 오픈소스 스크레이퍼의 상용 기반 사용
- 키워드 전수 폴링 × 결과당 과금 조합

## 설계 원칙 (Google API 조사와 동일)

- 사용자 요청마다 외부 API를 직접 호출하지 말 것 — 배치 수집기 → DB 저장 → 프론트는 내부 API만
- Discovery API는 일 단위 갱신 데이터(trending_history)이므로 **수집 주기는 1~6시간이면 충분** — 실시간 폴링 불필요
- oEmbed 결과는 DB/캐시에 저장 (영상별 1회 호출)
- 현재 DB 스키마(`sources`/`keywords`/`trend_snapshots`)에 그대로 매핑 가능: source="TikTok Discovery API", keyword=해시태그, snapshot에 rank/views/rank_change 저장

## 다음 액션 아이템

1. [ ] TikTok for Business 가입 → business-api.tiktok.com 개발자 앱 등록 → 광고주 계정(advertiser_id) 생성
2. [ ] `/discovery/trending_list/` 실호출로 검증: KR 지원 여부, 권한 심사 유무, 레이트리밋, 카테고리별 응답 품질
3. [ ] oEmbed로 대표 영상 임베드 프로토타입 (즉시 가능)
4. [ ] 1번이 막히면 Apify doliz 액터로 소규모($5 이하) 테스트 후 플랜 B 평가
5. [ ] 상용화 전 국내 법률 검토 (수집 합법성/ToS — domain-differentiators D1의 체크박스 항목)

## 미검증 항목 (명시)

- Discovery API의 country_code 지원 국가 목록 (KR 포함 여부 — UI에는 존재)
- Discovery API의 별도 권한 심사 유무와 레이트리밋 수치
- oEmbed의 실제 레이트리밋
- Creative Center 비로그인 브라우저 열람 범위 (소스 간 상충)
- 노래/크리에이터/비디오 트렌드 제거에 대한 TikTok 공식 공지 (리디렉션 관찰 + 서드파티 노트로만 확인)
- TokAPI/ScrapTik RapidAPI 플랜 세부, TikAPI Business 티어 한도, Data365 크레딧 단가

## 참고 링크

- TikTok Business API SDK (Discovery 스펙): https://github.com/tiktok/tiktok-business-api-sdk
- TikTok API for Business 포털: https://business-api.tiktok.com/portal
- Discovery 해시태그 상세 문서: https://business-api.tiktok.com/portal/docs/get-details-of-a-popular-hashtag/v1.3
- Research API: https://developers.tiktok.com/products/research-api/
- Research API FAQ: https://developers.tiktok.com/doc/research-api-faq
- Display API: https://developers.tiktok.com/doc/display-api-overview
- Commercial Content API: https://developers.tiktok.com/products/commercial-content-api
- oEmbed / 임베드: https://developers.tiktok.com/doc/embed-videos
- Creative Center 트렌드(현행): https://ads.tiktok.com/creative/creativeCenter/trends/hashtag
- Creative Center Trends 헬프: https://ads.tiktok.com/help/article/trend-discovery
- TikTok Next 2026 리포트(한국어): https://ads.tiktok.com/business/ko/next
- Apify doliz Creative Center 액터: https://apify.com/doliz/tiktok-creative-center-scraper
- Apify clockworks TikTok 스크레이퍼: https://apify.com/clockworks/tiktok-scraper
- ScrapTik: https://scraptik.com/
- EnsembleData: https://ensembledata.com/apis/docs
- TikAPI: https://tikapi.io/
- hiQ v. LinkedIn 정리: https://en.wikipedia.org/wiki/HiQ_Labs_v._LinkedIn
- TikTok 스크래핑 대응 공식 블로그: https://www.tiktok.com/privacy/blog/how-we-combat-scraping/en

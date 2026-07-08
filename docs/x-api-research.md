# X(트위터) API 트렌드 분석 사이트 구축 사전 조사

- **조사일**: 2026-07-08
- **기준 문서**: docs.x.com 공식 문서 + X 개발자 커뮤니티 공지 + 서드파티 비교 자료
- **검증 방법**: ① 공식 문서 직접 조회(WebFetch) ② 복수 출처 교차 확인 ③ 엔드포인트 실존 여부 무인증 curl 프로브(401 응답 = 라우트 실존 확인)

> ⚠️ **핵심 전제**: 2026-02-06부터 X API는 **pay-per-use(종량제)가 신규 개발자 기본 모델**이다. 기존 Free/Basic($200)/Pro($5,000) 월정액 티어는 신규 가입 불가. 요금은 2026-04-20에 한 차례 개정됐고(owned reads $0.001로 인하 등) 앞으로도 바뀔 수 있으므로, 계약 전 반드시 Developer Console의 실시간 단가표를 재확인할 것.

---

## 1. 얻을 수 있는 데이터 종류

> 🧩는 TrendDrop 기획서의 기능 우선순위(P1 MVP 필수 / P2 후속 / P3 고도화) 기준 매핑.

### 1.1 포스트(트윗) 데이터 — ✅ 제공

Post 객체에서 `tweet.fields` 파라미터로 선택 요청:

| 항목 | 필드 | 비고 |
|---|---|---|
| 본문 | `text` | 기본 제공 |
| 작성 시각 | `created_at` | ISO 8601 |
| 언어 | `lang` | 자동 감지된 언어 코드 |
| 지역 | `geo` | **사용자가 위치 태그를 붙인 포스트에만 존재** — 실제 부착률이 매우 낮아(통상 1~2% 미만으로 알려짐) 지역 분석의 주 소스로 쓰기 어려움. `place` 확장으로 도시 단위 정보 획득 가능 |

> 💰 **비용**: 포스트 1건당 $0.005 (read 과금). 검색 1회 요청으로 최대 100건 수신 시 요청당 최대 $0.50
> 🧩 **TrendDrop 활용**: "왜 뜨는지" 요약 원재료(P1-2), 관련 게시물 묶음(P2-6), 기간 필터(P2-7). geo는 미사용 권장

### 1.2 참여 지표(engagement metrics) — ✅ 제공

- `public_metrics`: **retweet_count, reply_count, like_count, quote_count, impression_count(조회수), bookmark_count** — 앱 전용(Bearer) 인증으로 모든 공개 포스트에 대해 조회 가능
- `non_public_metrics`(URL 클릭, 프로필 클릭 등): **본인 소유 포스트에 한해** user-context(OAuth) 인증 필요 → 타인 트윗 트렌드 분석에는 사용 불가

> 💰 **비용**: **추가 비용 없음** — 포스트 read($0.005/건)에 포함. `tweet.fields=public_metrics`만 붙이면 같은 값에 딸려옴
> 🧩 **TrendDrop 활용**: 상승률·확산 속도 지표(P1-1), 예비 급상승 감지(P1-4) — "반응·확산 중심" 정체성의 핵심 데이터

### 1.3 엔티티 — ✅ 구조화 제공

`entities` 필드로 **hashtags, mentions, urls, cashtags**가 오프셋 포함 구조화 JSON으로 제공. 추가로 `context_annotations`(X가 자동 분류한 도메인/엔티티 주석 — 인물, 브랜드, 이벤트 등)도 제공되어 트렌드 토픽 분류에 유용.

> 💰 **비용**: **추가 비용 없음** — 포스트 read($0.005/건)에 포함 (`tweet.fields`로 요청)
> 🧩 **TrendDrop 활용**: 카테고리 자동 분류(P1-3, `context_annotations` 활용), 연관 키워드(P1-2), 뉴스 맥락 연결(P2-9, urls 추출)

### 1.4 공식 Trends 엔드포인트 — ✅ 존재

- **`GET /2/trends/by/woeid/{woeid}`** — 지역별(WOEID 기준) 실시간 트렌딩 토픽 반환. `trend_name`, `tweet_count` 포함. (curl 프로브로 라우트 실존 확인 완료)
- WOEID 예: 전세계 1, 미국 23424977, 일본 23424856, **한국 23424868**, 서울 1132599
- 웹의 "나를 위한 트렌드(개인화 트렌드)"는 API로 노출되지 않음 — API 트렌드는 지역 단위 플랫폼 집계값
- v1.1의 `trends/place`는 레거시. v2 엔드포인트 사용 권장

> 💰 **비용**: 요청 1회당 ~$0.01 (가정치, 콘솔 확인 필요) — **한 번에 최대 50개 트렌드 + 볼륨을 통째로 받아도 1회 값**이라 데이터당 단가 최저
> 🧩 **TrendDrop 활용**: 실시간 트렌드 피드(P1-1)의 X 채널 소스, `tweet_count` 시계열로 예비 급상승 감지(P1-4), 감지 채널 뱃지(P1-5)

### 1.5 검색/스트리밍 — ✅ 제공

- **Recent search** (`/2/tweets/search/recent`): 최근 7일, 키워드/해시태그/언어/지역 연산자 검색
- **Full-archive search** (`/2/tweets/search/all`): **2006년 3월(트위터 창립)까지 전체 아카이브** 검색 — pay-per-use 및 Enterprise에서 사용 가능
- **Filtered stream** (`/2/tweets/search/stream`): 룰 기반 실시간 스트리밍. P99 지연 약 6~7초

> 💰 **비용**: 셋 다 **받은 포스트 건수 × $0.005** 과금. Recent search 1회 최대 100건 = 요청당 최대 $0.50 / Full-archive 1회 최대 500건 = 요청당 최대 $2.50 / Stream은 흘러들어온 건수만큼 — `max_results`를 낮게 잡으면 요청당 비용도 그만큼 낮아짐
> 🧩 **TrendDrop 활용**: recent search가 주력 — 트렌드 상세·카테고리 피드용 대표 트윗 수집(P1-2/P1-3). full-archive는 30일+ 기간 필터(P2-7, 자체 저장으로 대체 권장), stream은 급등 알림(P3-11)용으로 보류

### 1.6 사용자 메타데이터 — ✅ 제공

User 객체: `public_metrics`(followers_count, following_count, tweet_count, listed_count), `verified`(bool), `verified_type`(blue/business/government), `created_at`, `description`, `location`(자유 텍스트) 등.

> 💰 **비용**: 유저 1건당 $0.010 (포스트의 2배). ⚠️ **`expansions=author_id`로 트윗에 작성자 정보를 딸려 받아도 유저 read로 별도 과금됨** — 트윗 100건 + 작성자 확장 = $0.50 + 최대 $1.00. 같은 유저는 24시간 중복 제거로 하루 1회만 과금. 독립 user lookup 1회 최대 100명 = 요청당 최대 $1.00
> 🧩 **TrendDrop 활용**: "어디서 시작됐는지" 발원 계정 표시(P1-2), 봇 계정 필터링으로 지표 왜곡 방지
> 💡 **절약 팁**: 대표 트윗 수집 시 작성자 확장을 습관적으로 붙이지 말 것 — 인기 트윗 소수에만 선별 적용하면 유저 비용을 수 배 절감
> 🧩 **서비스 활용**: 대표 트윗에 **작성자 팔로워 수·인증 배지 표시**(신뢰도), **토픽 주도 인플루언서 랭킹**, 계정 생성일로 **봇/어뷰징 계정 필터링**

---

## 2. 엔드포인트별 상세

**검증 상태**: 아래 5개 엔드포인트 모두 2026-07-08 무인증 curl 호출 시 `HTTP 401 Unauthorized` 반환 → 라우트 실존·활성 확인.

| 엔드포인트 | 경로 | 이용 가능 | 페이지네이션(요청당 최대) | Rate limit (15분) |
|---|---|---|---|---|
| Recent search | `/2/tweets/search/recent` | pay-per-use, Enterprise | 100건 (`max_results`) | 앱 450 / 유저 300 |
| Full-archive search | `/2/tweets/search/all` | pay-per-use, Enterprise | **500건** | 300 (+ 초당 1회 제한) |
| Filtered stream | `/2/tweets/search/stream` | pay-per-use, Enterprise | 스트리밍(연결 유지) | 연결 시도 50 |
| Trends by WOEID | `/2/trends/by/woeid/:id` | pay-per-use(요금표는 콘솔 확인), Enterprise | 지역당 트렌드 목록 일괄 반환 | 75 |
| User lookup | `/2/users/*` | pay-per-use, Enterprise | 100건 | 앱 300 / 유저 900 |
| Tweet lookup | `/2/tweets` | pay-per-use, Enterprise | 100건 | 앱 3,500 / 유저 5,000 |

보충:

- **쿼리 길이**: recent search 512자, full-archive 1,024자 (Enterprise는 4,096자)
- **Filtered stream 룰**: pay-per-use 프로젝트당 1,000룰 × 룰당 1,024자 (Enterprise 25,000룰+, 2,048자)
- **Rate limit과 과금은 별개** — 공식 문서 명시: "rate limit 이내여도 과금되고, rate limit에 걸려도 추가 과금은 없다." Rate limit은 시스템 안정성용, 과금은 반환된 리소스 수 기준.

---

## 3. 비용 구조 (2026년 pay-per-use)

### 3.1 항목별 단가 (공식 문서 [docs.x.com/x-api/getting-started/pricing] 확인, 2026-07-08)

| 항목 | 단가 | 단위 |
|---|---|---|
| **Post read (읽기)** | **$0.005** | 리소스(포스트 1건)당 |
| User read | $0.010 | 유저 1건당 |
| Post write (일반 텍스트) | $0.015 | 요청당 |
| Post write (URL 포함) | **$0.200** | 요청당 |
| Owned reads (본인 데이터) | $0.001 | 리소스당 (2026-04-20 인하) |
| Likes/Mutes/Blocks 읽기 | $0.001 | 리소스당 |
| Lists/Spaces/Communities 읽기 | $0.005 | 리소스당 |
| DM/팔로워 읽기 | $0.010 | 리소스당 |
| Trends 조회 | 콘솔 단가표 확인 필요 (서드파티 자료 기준 요청당 ~$0.010) | 요청당 |

- **크레딧 선불 충전제**: Developer Console에서 크레딧 구매 → 호출 시 실시간 차감. 구독료 없음
- **24시간(UTC) 중복 제거**: 같은 리소스를 하루 안에 여러 번 받아도 1회만 과금 — 폴링 기반 수집 시 실효 비용 절감 요인
- ~~신규 프로젝트 $500 무료 크레딧~~ — **2026-03 지급 종료 확인**. 클로즈드 베타(2025-10) 참가자 한정 바우처였고, 정식 출시 후 X 직원이 "더 이상 프로모션/바우처 없음"을 공식 확인 ([devcommunity 스레드](https://devcommunity.x.com/t/missing-500-free-credit-pay-per-use-beta/258954), 2026-03-06). 결제 수단 등록 + 크레딧 충전 필요(최소 충전액 강제는 없음)
- X API 크레딧 구매액의 최대 20%를 xAI API 크레딧으로 리베이트

### 3.2 비용 시뮬레이션 (post read $0.005 기준)

| 시나리오 | 일간 수집량 | 월간 read | 월 비용(공식 API) |
|---|---|---|---|
| A. 소규모 (키워드 몇 개, 시간별 폴링) | ~3,000건 | ~9만 건 | **~$450** |
| B. 중간 (프롬프트 가정: 일 1만 건) | 10,000건 | ~30만 건 | **~$1,500** |
| C. 대규모 (스트리밍 상시 수집) | ~66,000건 | 200만 건(상한) | **~$10,000** |

- 트렌드 엔드포인트만 쓰는 경우: 5개 지역 × 시간당 1회 = 월 3,600요청 → 요청당 $0.01 가정 시 **월 ~$36** (매우 저렴)
- 중복 제거 효과: 같은 인기 트윗이 여러 쿼리에 반복 등장하는 트렌드 수집 특성상 실비용은 명목치보다 10~30% 낮아질 수 있음(수집 패턴에 따라 상이)

### 3.3 월 200만 read 상한 도달 시

- pay-per-use는 **월 200만 post read 하드캡** ([docs.x.com/x-api/fundamentals/post-cap] "Usage and Billing"). 초과 시 그 달은 추가 읽기 불가
- 유일한 공식 대안은 **Enterprise**: 영업 협의 필수, **월 $42,000부터** 시작하는 것으로 알려짐 (공개 가격표 없음)

---

## 4. 접근 제약 및 정책

### 4.1 가입 절차 (2026년 기준)

1. developer.x.com에서 개발자 계정 생성 (X 계정 + 전화번호 인증 필요)
2. 프로젝트/앱 생성 → 사용 목적 기재
3. **pay-per-use 온보딩**: 결제 수단 등록 + 크레딧 충전 후에야 API 호출 가능
4. 일반 용도는 자동 승인. **AI 학습·봇 용도는 추가 심사** 트리거

### 4.2 무료/공익 접근

- **무료 티어는 신규 가입자에게 완전히 폐지됨**
- 예외: **"for-good public utility apps"** — 재난·기상·교통 등 공공안전 정보를 게시하는 정부/공공 서비스 성격의 앱에 한해 **케이스 바이 케이스 심사**로 무료 스케일 접근 허용. 상업적 트렌드 분석 사이트는 해당 가능성 낮음
- **학술 연구 트랙(Academic Research)은 2023년 폐지** 후 2026년 현재까지 부활하지 않음

### 4.3 데이터 저장·재가공·재배포 (Developer Agreement & Policy)

| 행위 | 허용 여부 |
|---|---|
| 자체 DB 저장 | ✅ 허용 — 단, X 상의 최신 상태와 동기화 유지 의무 |
| 통계·집계 가공 후 공개 (예: "오늘 #A 해시태그 5만 건") | ✅ 대체로 허용 — 원본 콘텐츠가 아닌 **파생 집계물**은 배포 제한의 직접 대상이 아님. 트렌드 분석 사이트의 핵심 모델로 적합 |
| 원본 트윗 텍스트 대량 재배포 (데이터셋 제공 등) | ❌ 원칙적 금지 — 제3자에게는 **ID만 배포 가능**(Post ID/User ID), 30일당 150만 ID 초과 배포는 서면 허가 필요 |
| 개별 트윗 화면 표시 | ✅ Display Requirements(공식 임베드/표시 규격) 준수 시 허용 |
| Off-X 매칭 (X 유저를 외부 신원과 연결) | ⚠️ 유저의 명시적 opt-in 동의 필요 |

### 4.4 컴플라이언스 의무 (삭제 동기화)

- **트윗이 X에서 삭제/비공개 전환되면 우리 DB에서도 삭제·수정해야 함** — "가능한 한 빨리(as soon as reasonably possible)", X 또는 계정 소유자의 요청 수신 시 **24시간 이내**
- 실무 구현: **batch compliance 엔드포인트**(저장한 Post ID 목록 업로드 → 삭제/보호 상태 반환)를 주기 실행하거나, compliance 스트림 구독으로 삭제 이벤트 반영
- 시사점: 원문을 장기 보관하는 설계라면 컴플라이언스 파이프라인이 **필수 기능**. 집계값만 저장하고 원문을 단기 보관(예: 30일 TTL)하는 설계가 리스크를 크게 줄임

---

## 5. 대안 옵션 비교

| 항목 | 공식 X API (pay-per-use) | TwitterAPI.io | 기타 서드파티 (Sorsa, Postproxy, ScrapeCreators 등) |
|---|---|---|---|
| 트윗 읽기 단가 | $5.00 / 1,000건 | **$0.15 / 1,000건** (~33배 저렴) | $0.05~$0.50 / 1,000건 |
| 유저 조회 단가 | $10.00 / 1,000건 | $0.18 / 1,000건 | 유사 범위 |
| 월 200만 read 시 | ~$10,000 (하드캡) | ~$300 (캡 없음) | ~$100~$1,000 |
| 최소 결제 | 크레딧 선충전 필요 | 없음 (호출당 최소 $0.00015, 크레딧 무기한) | 업체별 상이 |
| Full-archive 검색 | ✅ 2006년까지 | ✅ 제공 (커버리지·정합성은 자체 검증 필요) | 업체별 상이 |
| 실시간 스트리밍 | ✅ filtered stream (P99 6~7초) | 폴링/웹훅 방식 (진짜 push 스트림 아님) | 대부분 폴링 |
| 공식 Trends 엔드포인트 | ✅ | 트렌드 유사 기능 제공 (플랫폼 공식 집계와 동일 보장 없음) | 업체별 상이 |
| 데이터 출처 | 공식 | **비공식(스크래핑 기반)** | 비공식(스크래핑 기반) |
| 약관 리스크 | 낮음 (정책 준수 시) | **높음** — X ToS상 스크래핑 금지. X가 스크래퍼 상대 소송 이력(Bright Data 소송 등) 있음. 서비스 차단·데이터 공급 중단 리스크 상시 존재 | 동일하게 높음 |
| 안정성/SLA | 상대적으로 높음 | 보장 없음 — X의 차단 조치에 취약 | 보장 없음 |
| 컴플라이언스 지원 | ✅ compliance 엔드포인트 제공 | ❌ 삭제 동기화 수단 없음 → GDPR/개인정보 리스크 자체 부담 | ❌ |

**서드파티 리스크 정리**: 가격은 1~2 자릿수 저렴하지만 전부 스크래핑 기반으로 X 약관 위반 영역에서 동작한다. (1) 어느 날 갑자기 공급 중단 가능, (2) 상업 서비스가 이를 기반으로 하면 법적 노출(특히 수익화·재배포 시), (3) 삭제된 트윗 처리 의무를 이행할 공식 수단이 없음.

---

## 6. 결론 및 권고

### 6.1 최소 기능 기준 최저가 구성 (권장)

트렌드 분석 사이트의 최소 기능을 "지역별 트렌딩 토픽 + 토픽별 대표 트윗/볼륨 추이"로 정의하면:

**권장 아키텍처 — "Trends 엔드포인트 중심 + 검색 최소화" (공식 API)**

1. `GET /2/trends/by/woeid` 를 시간당 폴링 (한국/서울/전세계 등) → **월 ~$40 수준**, `tweet_count`로 볼륨까지 확보
2. 상위 트렌드 토픽에 대해서만 recent search로 대표 트윗 소량(토픽당 10~20건) 수집 → read 과금 최소화
3. 원문은 짧은 TTL로 보관, 공개 화면에는 집계값 + 공식 임베드만 노출 → 컴플라이언스 부담 최소화

이 구성이면 **월 $100~500 이내**로 공식 API 기반의 합법적 서비스가 가능하다. "모든 트윗을 긁어서 직접 트렌드를 계산"하는 설계는 pay-per-use에서 비용이 폭증하므로(§3.2 C안 = $10,000) X가 이미 계산해 둔 Trends 엔드포인트를 최대한 활용하는 것이 핵심.

### 6.2 트래픽 규모별 월 비용 범위

| 시나리오 | 구성 | 월 예상 비용 |
|---|---|---|
| **S: MVP** | Trends 폴링 + 토픽당 소량 검색 (일 ~2천 read) | **$70~350** |
| **M: 성장기** | + 키워드 트래킹, 일 1만 read | **$1,300~1,700** |
| **L: 본격 수집** | filtered stream 상시, 월 200만 read 상한 근접 | **~$10,000** (상한) / 초과 시 Enterprise $42,000+ |

(참고: 동일 물량을 TwitterAPI.io로 하면 S ~$10, M ~$45, L ~$300 — 단 §5의 약관·지속성 리스크 감수 전제)

### 6.3 리스크 요약

1. **가격 정책 변동성 — 최대 리스크**. 2023년(유료화) → 2026-02(종량제 전환) → 2026-04(단가 개정)로 짧은 주기 변경 이력. 단가를 하드코딩하지 말고 비용 모니터링/서킷브레이커를 설계에 포함할 것
2. **200만 read 하드캡**: 성장 시 Enterprise($42k+/월)로의 절벽. 처음부터 read 수요를 줄이는 아키텍처(Trends 활용, 중복 제거, 캐싱)로 설계해야 함
3. **컴플라이언스 의무**: 원문 저장 시 삭제 동기화(24시간) 필수. 집계 중심 설계로 회피 가능
4. **재배포 제한**: 원문 대량 공개 불가(ID만, 150만/30일). 통계·차트 중심 서비스는 안전
5. **서드파티 의존 리스크**: 비용 절감 폭은 크지만 스크래핑 기반 = 약관 위반 + 공급 중단 가능성. 프로토타입 검증용으로 제한적 사용은 고려 가능하나 프로덕션 단일 의존은 비권장
6. **geo 데이터 희소성**: 트윗 단위 위치 정보는 실질적으로 못 쓴다고 가정하고, 지역성은 Trends WOEID 또는 유저 프로필 location으로 대체할 것

---

## 출처 (확인일: 2026-07-08)

**공식 (직접 조회로 검증)**
- [X API pay-per-usage pricing and credits](https://docs.x.com/x-api/getting-started/pricing) — 단가표, 크레딧, 중복 제거
- [Trends by WOEID](https://docs.x.com/x-api/trends/trends-by-woeid/introduction) — 트렌드 엔드포인트
- [Search Posts introduction](https://docs.x.com/x-api/posts/search/introduction) — recent/full-archive 비교
- [Filtered stream introduction](https://docs.x.com/x-api/posts/filtered-stream/introduction) — 룰 한도, 지연
- [Rate limits](https://docs.x.com/x-api/fundamentals/rate-limits) — 15분 윈도우 한도
- [Data dictionary](https://docs.x.com/x-api/fundamentals/data-dictionary) — Post/User 필드
- [Usage and Billing (post cap)](https://docs.x.com/x-api/fundamentals/post-cap) — 월 200만 read 상한
- [X Developer Agreement and Policy](https://developer.x.com/en/developer-terms/agreement-and-policy) — 저장/재배포/삭제 의무
- 엔드포인트 실존 검증: `api.x.com/2/{trends,search/recent,search/all,search/stream,users}` 무인증 curl → 전부 401 (2026-07-08)

**공지/커뮤니티**
- [Announcing the Launch of X API Pay-Per-Use Pricing](https://devcommunity.x.com/t/announcing-the-launch-of-x-api-pay-per-use-pricing/256476) (2026-02-06)
- [X API Pricing Update: Owned Reads Now $0.001 (2026-04-20)](https://devcommunity.x.com/t/x-api-pricing-update-owned-reads-now-0-001-other-changes-effective-april-20-2026/263025) *(403으로 직접 열람 불가 — 검색 결과 요약으로 확인)*
- [For-good Public Utility 무료 접근 관련 커뮤니티 스레드](https://devcommunity.x.com/t/question-about-for-good-public-utility-apps-eligibility-application-process-free-scaled-access/260640)

**서드파티/비교 (교차 확인용 — 단가 주장은 공식 콘솔에서 재검증 필요)**
- [TwitterAPI.io Pricing](https://twitterapi.io/pricing) — $0.15/1,000 tweets (직접 조회로 확인)
- [Postproxy: X API Pricing in 2026](https://postproxy.dev/blog/x-api-pricing-2026/)
- [Sorsa: X API Pricing 2026](https://api.sorsa.io/blog/twitter-api-pricing-2026)
- [Blotato: X API Pricing Guide](https://www.blotato.com/blog/twitter-api-pricing)
- [xpoz: Twitter API Alternatives 2026](https://www.xpoz.ai/blog/comparisons/best-twitter-api-alternatives-2026/)
- [Netrows: Top Twitter/X Data API Providers](https://www.netrows.com/blog/top-twitter-x-data-api-providers-2026)

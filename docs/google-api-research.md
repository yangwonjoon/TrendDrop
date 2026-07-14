# TrendDrop Google API Research

작성일: 2026-07-05

## 목적

TrendDrop에서 활용 가능한 Google 계열 API를 조사하고, 어떤 방식으로 활용하는 것이 적합한지, 트래픽과 쿼터 관점에서 무엇을 조심해야 하는지 정리한다.

이 문서는 아래 질문에 답하는 것을 목표로 한다.

- Google이 제공하는 어떤 종류의 API가 TrendDrop과 관련이 있는가
- 각 API는 어떤 데이터에 강하고 어떤 한계가 있는가
- 트래픽, 쿼터, 비용, 캐싱은 어떻게 설계해야 하는가
- 약관, 정책, 데이터 품질 측면에서 어떤 리스크가 있는가

## 한눈에 보는 결론

TrendDrop 관점에서 Google 계열 API를 정리하면 아래처럼 보는 것이 현실적이다.

### 바로 검토할 가치가 큰 API

1. YouTube Data API
2. YouTube Analytics API
3. Google Ads API Keyword Planning
4. Google Search Console API

### 보조적으로만 봐야 하는 API

1. Indexing API
2. Custom Search JSON API

### 핵심 판단

- `Google Trends`는 현재 공식적인 공개 개발자 API를 찾지 못했다
- `YouTube Data API`는 공개 트렌드/콘텐츠 탐색용으로 가장 현실적이다
- `Google Ads Keyword Planning`은 키워드 아이디어와 수요 추정에 강하지만, 일반적인 실시간 트렌드 피드용 API는 아니다
- `Search Console API`는 내 사이트 데이터에는 매우 유용하지만, 인터넷 전반 트렌드 수집용은 아니다
- `Custom Search JSON API`는 신규 고객이 받을 수 없고 종료 전환 일정이 있어서 신규 설계 기준으로는 추천하기 어렵다

## 가장 먼저 알아둘 점: Google Trends

현재 공식 Google for Developers 문서 기준으로는 `Google Trends`에 대한 공개 개발자 API 문서를 확인하지 못했다.

이건 중요한 포인트다.

- 웹사이트로는 Google Trends를 사용할 수 있음
- 하지만 공식적인 공개 API를 전제로 제품 설계를 시작하면 위험함
- 인터넷에 있는 비공식 라이브러리나 크롤링 방식은 약관, 안정성, 차단 리스크가 큼

정리:

- TrendDrop에서 `Google Trends API`를 핵심 전제로 잡는 것은 추천하지 않음
- 대신 `YouTube`, `Google Ads`, `Search Console` 같은 공식 API로 우회적으로 Google 신호를 조합하는 편이 안전함

이 부분은 `공식 문서 부재`를 근거로 한 판단이다.

## API별 조사

## 1. YouTube Data API

공식 문서:

- https://developers.google.com/youtube/v3/getting-started
- https://developers.google.com/youtube/v3/determine_quota_cost

무엇을 할 수 있나:

- 동영상, 채널, 재생목록, 검색 결과 등 YouTube 공개 데이터를 조회
- 특정 키워드로 영상/채널 검색
- 영상 메타데이터, 통계, 카테고리, 채널 정보 조회

TrendDrop에서의 활용:

- SNS/영상 기반 트렌드 신호 수집
- 특정 키워드 관련 인기 영상 묶음 생성
- 카테고리별 급상승 주제 탐색 보조
- 트렌드 카드에 대표 영상이나 채널 연결

장점:

- 공식 API이고 공개 데이터 활용 경로가 분명함
- 트렌드, 밈, 숏폼 관련 대중 관심사를 반영하기 좋음
- 검색, 동영상 메타데이터, 통계 연계가 가능함

한계:

- YouTube 내부 신호이지 전체 웹 트렌드는 아님
- 검색 결과의 안정성이나 대표성은 항상 완벽하지 않음
- 공개 콘텐츠 중심이라 비공개/제한 데이터는 접근 불가

트래픽 및 쿼터 관점:

- YouTube Data API는 쿼터 시스템을 사용함
- 공식 문서에 따르면 모든 요청은 최소 1포인트 이상 차감됨
- 기본 할당량은 `search.list 100회/일`, `videos.insert 100회/일`, 그리고 나머지 엔드포인트 합산 `10,000 units/day`로 안내됨
- 추가 페이지 요청도 쿼터를 다시 사용함

실무 팁:

- `search.list`는 비싸게 느껴질 수 있으니 서버에서 배치 수집 후 캐시해야 함
- `part`와 `fields`를 적극 사용해서 필요한 필드만 받는 것이 좋음
- 앱 클라이언트가 직접 API를 치지 말고 서버에서 호출해야 함

추천 활용 방식:

1. 서버에서 10분 또는 30분 주기로 카테고리별 키워드 수집
2. 결과를 자체 DB에 저장
3. 프론트는 캐시된 내부 API만 조회
4. 영상 상세는 클릭 시 지연 로딩

## 2. YouTube Analytics API / Reporting API

공식 문서:

- https://developers.google.com/youtube/analytics

무엇을 할 수 있나:

- 조회수, 시청 시간, 인기 지표, 시청자 통계 등 분석 데이터 조회
- bulk report와 targeted query 두 방식 제공

TrendDrop에서의 활용:

- 자사 운영 채널이 있다면 내부 콘텐츠 성과 측정에 유용
- 채널 단위/영상 단위의 성과 리포트를 자동화할 수 있음

장점:

- 대시보드와 리포팅 자동화에 강함
- bulk report와 실시간성 query를 나눠 쓸 수 있음

한계:

- 대체로 `내가 접근 권한이 있는 채널 데이터` 중심
- 인터넷 전체 트렌드 탐색용 API는 아님

판단:

- TrendDrop의 `외부 트렌드 수집 API`로는 우선순위가 낮음
- 나중에 TrendDrop 공식 YouTube 채널을 운영하면 운영 데이터 분석용으로 좋음

## 3. Google Ads API Keyword Planning

공식 문서:

- https://developers.google.com/google-ads/api/docs/get-started/introduction
- https://developers.google.com/google-ads/api/docs/keyword-planning/overview

무엇을 할 수 있나:

- 키워드 아이디어 생성
- 연관 키워드 묶음 탐색
- historical metrics 조회
- forecast metrics 조회

TrendDrop에서의 활용:

- 키워드 아이디어 발굴
- 특정 트렌드 키워드의 검색 수요 검증
- 카테고리별 수요성 평가
- `지금 뜨는 신호`와 `광고 수요가 있는 주제`를 분리해 해석

장점:

- 키워드 리서치에 매우 강함
- 검색량, CPC, 예측 등 광고/수요 관점 데이터가 유용함
- 단순 SNS 화제성이 아니라 상업적 관심도도 같이 볼 수 있음

한계:

- 실시간 소셜 트렌드 API가 아님
- 접근 설정과 인증이 상대적으로 무겁고 복잡함
- 광고 계정/정책/개발자 토큰 등 운영 요건을 이해해야 함

트래픽 및 쿼터 관점:

- 공식 문서상 Keyword Planning 서비스는 다른 서비스보다 더 강한 rate limit이 있음
- 분당 허용 요청 수가 더 적음
- 결과는 자주 바뀌지 않으므로 캐시 또는 저장을 강하게 권장
- historical metrics는 월 단위로 갱신된다고 안내됨

실무 팁:

- 사용자 요청마다 직접 조회하지 말 것
- 하루 1회 또는 수시간 단위로 미리 수집해서 저장할 것
- `키워드 수요 검증 레이어`로 쓰고 메인 피드의 실시간 엔진으로 쓰지는 말 것

추천 활용 방식:

1. TrendDrop 내부에서 후보 키워드 생성
2. 배치 작업으로 Keyword Planning에 질의
3. 검색 수요, CPC, 예측치를 내부 점수에 반영
4. 사용자 화면에는 이미 계산된 점수만 노출

## 4. Google Search Console API

공식 문서:

- https://developers.google.com/webmaster-tools

무엇을 할 수 있나:

- Search analytics 조회
- 검증된 사이트 목록 조회
- 사이트맵 관리

TrendDrop에서의 활용:

- TrendDrop 자체 사이트가 나중에 SEO 트래픽을 확보할 때 유용
- 어떤 검색어로 유입되는지, 클릭/노출/CTR/평균 위치를 추적 가능
- 사용자가 어떤 트렌드 페이지를 검색으로 발견하는지 분석 가능

장점:

- 무료에 가깝고 공식 데이터 품질이 좋음
- 자사 SEO 성과 분석에 매우 강함

한계:

- `내가 소유하고 검증한 사이트` 데이터만 의미가 있음
- 외부 인터넷 트렌드 수집용 API는 아님

판단:

- TrendDrop 운영 후반에 반드시 붙일 가치가 큼
- 하지만 MVP 단계의 `트렌드 수집 소스`로는 우선순위가 낮음

추천 활용 방식:

- 초기: 사용하지 않아도 됨
- 사이트 유입이 붙기 시작하면 바로 연결
- 어떤 트렌드 주제가 SEO 성과가 좋은지 측정하는 도구로 사용

## 5. Indexing API

공식 문서:

- https://developers.google.com/search/apis/indexing-api/v3/quickstart

무엇을 할 수 있나:

- Google에 URL 추가/갱신/삭제를 직접 알림
- 요청 상태 확인
- 최대 100개까지 배치 요청

중요한 제한:

- `JobPosting` 또는 `BroadcastEvent embedded in a VideoObject` 페이지에만 사용 가능하다고 명시됨
- 일반 웹페이지나 일반 콘텐츠 전체에 쓰는 용도가 아님
- 스팸 탐지와 남용 제재가 강함

TrendDrop에서의 활용:

- 일반적인 트렌드 문서나 피드 페이지에는 부적합
- 만약 라이브 방송 데이터 전용 페이지를 별도로 운영한다면 제한적으로 검토 가능

판단:

- 현재 TrendDrop 핵심 API 후보로는 제외하는 것이 맞음

## 6. Custom Search JSON API

공식 문서:

- https://developers.google.com/custom-search/v1/overview

무엇을 할 수 있나:

- Programmable Search Engine 기반 검색 결과를 JSON으로 조회
- 웹 검색 또는 이미지 검색 결과 활용

매우 중요한 상태:

- 공식 문서에 따르면 `신규 고객에게 닫혀 있음`
- 기존 고객도 `2027-01-01`까지 다른 대안으로 전환해야 함
- 무료 100쿼리/일, 추가는 `1000쿼리당 $5`, 하루 최대 10k 쿼리

TrendDrop에서의 활용:

- 신규 프로젝트 기준으로는 추천하지 않음

판단:

- 새로 설계하는 TrendDrop의 핵심 의존성으로 두면 안 됨
- 대체로 제외가 맞음

## TrendDrop에 추천하는 조합

현재 시점에서 가장 현실적인 Google 계열 조합은 아래다.

### 1순위

- YouTube Data API

이유:

- 공개 트렌드 콘텐츠를 잡는 데 가장 현실적이고 공식 경로가 분명함

### 2순위

- Google Ads API Keyword Planning

이유:

- 키워드 수요 검증과 점수 보정에 좋음
- 메인 수집 소스가 아니라 보조 검증 엔진으로 쓰는 편이 맞음

### 3순위

- Google Search Console API

이유:

- 제품 운영 이후 SEO 성과 측정에 매우 중요함

### 제외 또는 낮은 우선순위

- Indexing API
- Custom Search JSON API
- 비공식 Google Trends 크롤링

## 트래픽, 쿼터, 비용 설계에서 꼭 고려할 것

## 1. 사용자 요청마다 Google API를 직접 호출하지 말 것

가장 중요한 원칙이다.

권장 구조:

1. 배치 수집기(worker)가 주기적으로 외부 API를 호출
2. 결과를 내부 DB 또는 캐시에 저장
3. 프론트엔드는 내부 API만 조회

이유:

- 외부 API 비용 절감
- 쿼터 초과 방지
- 응답속도 안정화
- 장애 격리

## 2. 소스별 freshness를 다르게 설계할 것

추천 예시:

- YouTube Data API: 10분 ~ 30분
- Google Ads Keyword Planning: 1일 ~ 7일
- Search Console API: 1일 단위

모든 소스를 같은 주기로 갱신하면 비효율적이다.

## 3. 캐시를 기본 전략으로 둘 것

특히 아래는 캐시가 필수다.

- 인기 키워드 목록
- 카테고리별 랭킹
- 영상 상세 메타데이터
- Google Ads 키워드 지표

추천:

- 메모리 캐시 + DB 저장 조합
- 키워드별 TTL 관리
- 동일 쿼리 중복 요청 방지

## 4. 쿼터 예산을 먼저 잡고 기능을 설계할 것

예를 들어 YouTube에서 다음처럼 예산을 잡을 수 있다.

- 카테고리 6개
- 카테고리당 20개 키워드
- 30분마다 수집

이 경우 실제 API 호출 수를 역산해서 하루 예산을 먼저 계산해야 한다.

특히 pagination이 붙는 순간 호출량이 급증한다.

## 5. 장애 대비 구조가 필요함

필수 항목:

- exponential backoff
- retry 제한
- stale cache fallback
- 소스별 circuit breaker
- 수집 실패 시 마지막 정상 데이터 유지

## 6. 관측성과 알림을 붙일 것

최소 모니터링 항목:

- 일별 API 호출량
- 엔드포인트별 실패율
- 평균 응답 시간
- 쿼터 소진율
- 캐시 hit ratio

## 조심해야 하는 부분

## 1. 약관과 정책

- 공식 API가 없는 영역을 크롤링으로 대체하면 차단 리스크가 커짐
- Google 계열 서비스는 정책 위반 시 키 제한, 프로젝트 제한, 접근 철회가 생길 수 있음
- YouTube는 별도 Terms, Developer Policies, Required Minimum Functionality 등을 확인해야 함

## 2. 인증정보 노출

- API key를 프론트엔드에 직접 노출하지 말 것
- OAuth client secret, developer token은 서버 보관
- Git 저장소에 키를 커밋하지 말 것

## 3. 데이터 해석 오류

- 검색량이 높다고 반드시 SNS 화제성이 높은 것은 아님
- YouTube 인기도가 전체 대중 트렌드와 항상 일치하지 않음
- Google Ads 수요는 상업성과 구매 의도에 더 가까움

즉, 서로 다른 종류의 신호를 섞어 쓸 때는 `무슨 의미의 점수인지`를 분리해야 한다.

## 4. 실시간성 착각

- 어떤 API는 사실상 near-real-time이지, 완전한 실시간은 아님
- Google Ads historical metrics처럼 갱신 주기가 느린 데이터는 실시간 피드에 직접 쓰면 안 됨

## 5. 개인정보와 사용자 데이터

- Search Console, YouTube Analytics는 계정 권한 기반 데이터가 포함될 수 있음
- 사용자 권한 데이터는 수집 범위, 저장 범위, 보관 기간을 명확히 해야 함

## 실제 추천 아키텍처

### 단계 1. MVP

- YouTube Data API만 우선 연결
- 카테고리별 키워드 배치 수집
- 내부 DB 저장
- 캐시된 트렌드 피드 제공

### 단계 2. 점수 보정

- Google Ads Keyword Planning 추가
- 키워드 수요성, CPC, historical metrics를 보조 점수로 사용

### 단계 3. 운영 최적화

- Search Console API 연결
- 어떤 TrendDrop 페이지가 검색 유입을 받는지 분석

## 최종 추천

현재 TrendDrop에는 아래 전략이 가장 안전하고 실용적이다.

1. `Google Trends API`를 핵심 전제로 잡지 않는다
2. `YouTube Data API`를 Google 계열 메인 트렌드 소스로 본다
3. `Google Ads Keyword Planning`을 수요 검증 보조 레이어로 붙인다
4. `Search Console API`는 서비스 운영 단계에서 SEO 분석용으로 쓴다
5. 모든 외부 API는 서버 배치 + 캐시 + 내부 DB 구조로 감싼다

## 참고 링크

- YouTube Data API Overview: https://developers.google.com/youtube/v3/getting-started
- YouTube Data API Quota: https://developers.google.com/youtube/v3/determine_quota_cost
- YouTube Analytics: https://developers.google.com/youtube/analytics
- Google Ads API Introduction: https://developers.google.com/google-ads/api/docs/get-started/introduction
- Google Ads Keyword Planning: https://developers.google.com/google-ads/api/docs/keyword-planning/overview
- Search Console API: https://developers.google.com/webmaster-tools
- Indexing API Quickstart: https://developers.google.com/search/apis/indexing-api/v3/quickstart
- Custom Search JSON API: https://developers.google.com/custom-search/v1/overview

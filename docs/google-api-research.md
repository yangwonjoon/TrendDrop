# TrendDrop Google 트렌드 소스 정리

작성일: 2026-07-15

## 결론

TrendDrop의 목적은 "내 서비스 데이터 분석"이 아니라 "외부에서 지금 뜨는 주제 후보를 수집"하는 것이다. 이 기준으로 MVP에 바로 쓸 Google 계열 소스는 아래 2개다.

1. YouTube Data API
2. Google News RSS

아래 3개는 지금 단계에서 제외한다.

- Google Ads API: 광고 계정 기반 키워드 플래닝 도구라 외부 실시간 트렌드 수집용이 아니다.
- Search Console API: 내가 소유·검증한 사이트의 검색 유입 분석용이다.
- YouTube Analytics API: 내가 권한을 가진 YouTube 채널 분석용이다.

## YouTube Data API

용도:

- 공개 YouTube 영상 검색
- 영상 제목, 설명, 채널명, 게시일 조회
- 조회수, 좋아요, 댓글 수 같은 공개 반응 지표 조회

TrendDrop에서 쓰는 방식:

1. 카테고리별 seed query를 정한다.
2. `search.list`로 관련 공개 영상을 찾는다.
3. `videos.list`로 조회수/좋아요/댓글 수를 가져온다.
4. Neon DB에 트렌드 후보로 저장한다.

현재 구현:

- `POST /api/admin/collect/youtube`
- API Lab의 `YouTube Data API 수집` 버튼

필요한 환경변수:

```env
YOUTUBE_API_KEY=
```

주의:

- Google 전체 검색어 급등 데이터가 아니다.
- YouTube 안에서 공개 영상 반응이 강한 주제를 잡는 신호다.
- `search.list`는 quota 비용이 크므로 서버에서 수집 후 DB에 저장한다.

## Google News RSS

용도:

- 특정 키워드에 대한 최신 뉴스 묶음 확인
- 기사 제목, 링크, 매체명, 발행일 기반으로 이슈 후보 포착

TrendDrop에서 쓰는 방식:

1. `https://news.google.com/rss/search?q=...&hl=ko&gl=KR&ceid=KR:ko` 형식으로 RSS를 조회한다.
2. 응답 XML을 서버에서 파싱한다.
3. 저장 없이 미리보기하거나 Neon DB에 트렌드 후보로 저장한다.

현재 구현:

- `GET /api/google-news/preview`
- `POST /api/admin/collect/google-news`
- API Lab의 `Google News RSS 미리보기`, `Google News RSS 저장` 버튼

필요한 환경변수:

- 없음

주의:

- 정식 JSON API가 아니라 RSS 피드다.
- 기사 언급량은 "트렌드 후보" 신호이지 검색량 자체가 아니다.
- 과도한 호출을 피하고 서버에서 캐시/DB 저장 중심으로 쓴다.

## 제외한 Google API

## Google Trends

공식 공개 API가 없다. 가장 원하는 데이터에 가깝지만, 비공식 라이브러리나 스크래핑은 차단/정책 리스크가 있어서 MVP 기본 구조로 잡지 않는다.

## Google Ads API

광고 계정, developer token, customer id가 필요한 광고주용 키워드 플래닝 도구다. TrendDrop이 외부 트렌드 후보를 수집하는 MVP 목적과 다르다.

## Search Console API

내가 소유하고 검증한 사이트의 검색 유입 데이터만 조회한다. TrendDrop 운영 후 "우리 서비스에 어떤 검색어로 유입되는가"를 보는 도구다.

## YouTube Analytics API

내가 권한을 가진 YouTube 채널의 분석 데이터를 조회한다. TrendDrop 공식 채널을 운영할 때 성과 분석에는 쓸 수 있지만 외부 트렌드 수집용은 아니다.

## 현재 프로젝트 기준 세팅

필수:

```env
DATABASE_URL=
YOUTUBE_API_KEY=
```

필요 없음:

```env
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CUSTOMER_ID=
GOOGLE_ADS_LOGIN_CUSTOMER_ID=
SEARCH_CONSOLE_SITE_URL=
YOUTUBE_CHANNEL_ID=
GOOGLE_REFRESH_TOKEN=
```

## MVP 수집 흐름

1. API Lab에서 `DB 테이블 생성`을 누른다.
2. `YouTube Data API 수집`으로 공개 영상 신호를 저장한다.
3. `Google News RSS 미리보기`로 뉴스 후보를 확인한다.
4. `Google News RSS 저장`으로 뉴스 기반 후보를 저장한다.
5. `저장된 트렌드 조회`로 DB에 쌓인 후보를 확인한다.

export type TrendItem = {
  rank: number;
  keyword: string;
  category: string;
  growth: string;
  velocity: string;
  source: string;
  summary: string;
  reason: string;
};

export type TimelineStep = {
  step: string;
  title: string;
  body: string;
};

export type WatchItem = {
  keyword: string;
  meta: string;
  score: string;
};

export const trends: TrendItem[] = [
  {
    rank: 1,
    keyword: "제로슈가 아이스티",
    category: "푸드",
    growth: "+182%",
    velocity: "9.1/10",
    source: "Instagram Reels, Facebook Groups",
    summary:
      "운동 루틴과 다이어트 브이로그에서 반복 노출되며 저장과 공유가 빠르게 늘어나는 중입니다.",
    reason: "짧은 레시피 영상과 체형관리 콘텐츠가 함께 묶이며 확산",
  },
  {
    rank: 2,
    keyword: "1박2일 근교여행",
    category: "여행",
    growth: "+149%",
    velocity: "8.5/10",
    source: "Facebook Travel Pages, Short-form Clips",
    summary:
      "주말 소비를 겨냥한 여행 추천 포스트가 검색과 댓글 반응을 동시에 끌고 있습니다.",
    reason: "휴가 시즌 전환과 함께 예약 전 탐색 수요가 증가",
  },
  {
    rank: 3,
    keyword: "여름 쿨톤 메이크업",
    category: "뷰티",
    growth: "+136%",
    velocity: "8.2/10",
    source: "Instagram Explore, Creator Posts",
    summary:
      "퍼스널 컬러 기반 짧은 튜토리얼이 저장 수와 재방문을 끌어올리고 있습니다.",
    reason: "인플루언서 비교 콘텐츠가 구매 직전 관심층을 자극",
  },
  {
    rank: 4,
    keyword: "생산성 데스크 셋업",
    category: "라이프",
    growth: "+121%",
    velocity: "7.8/10",
    source: "Facebook Video, Community Shares",
    summary:
      "재택근무와 공부 브이로그에서 반복 등장하며 구매 링크 클릭이 이어지고 있습니다.",
    reason: "정리 습관 콘텐츠와 가성비 기기 추천이 결합",
  },
  {
    rank: 5,
    keyword: "러닝 입문 챌린지",
    category: "피트니스",
    growth: "+113%",
    velocity: "7.6/10",
    source: "Instagram Stories, Challenge Feeds",
    summary:
      "초보자 러닝 인증 콘텐츠가 릴레이처럼 이어지며 태그 노출량이 늘어나는 흐름입니다.",
    reason: "공동 참여형 해시태그가 꾸준히 리치 확대",
  },
  {
    rank: 6,
    keyword: "AI 일정관리 템플릿",
    category: "테크",
    growth: "+108%",
    velocity: "7.4/10",
    source: "Creator Pages, Productivity Communities",
    summary:
      "업무 자동화 관련 추천 게시물이 세이브와 북마크를 빠르게 만들고 있습니다.",
    reason: "생산성 툴 관심층과 AI 관심층이 겹치며 점프",
  },
];

export const timelineSteps: TimelineStep[] = [
  {
    step: "01",
    title: "짧은 영상에서 먼저 반응이 시작됨",
    body: "반복 재생되는 릴스, 숏클립, 카드뉴스에서 저장 비율이 먼저 튀기 시작합니다.",
  },
  {
    step: "02",
    title: "커뮤니티와 그룹에서 실사용 후기가 붙음",
    body: "SNS 내부 그룹과 댓글에서 실제 후기, 비교, 추천 포인트가 붙으며 검색 의도가 강해집니다.",
  },
  {
    step: "03",
    title: "검색어와 구매 탐색으로 확장됨",
    body: "관심이 행동으로 바뀌는 시점에 TrendDrop이 키워드 상승과 확산 속도를 함께 보여줍니다.",
  },
];

export const watchItems: WatchItem[] = [
  { keyword: "비건 디저트", meta: "푸드 · 댓글 반응 증가", score: "68/100" },
  { keyword: "여름 출근룩", meta: "패션 · 저장률 상승", score: "64/100" },
  { keyword: "혼자 떠나는 부산", meta: "여행 · 공유수 증가", score: "62/100" },
  { keyword: "AI 공부 플래너", meta: "테크 · 북마크 증가", score: "59/100" },
];

export const categories = ["전체", ...new Set(trends.map((trend) => trend.category))];


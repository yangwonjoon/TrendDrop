export type YoutubeSeedQuery = {
  keyword: string;
  category: string;
  query: string;
  reasonHint: string;
};

export const youtubeSeedQueries: YoutubeSeedQuery[] = [
  {
    keyword: "여름 쿨톤 메이크업",
    category: "뷰티",
    query: "여름 쿨톤 메이크업",
    reasonHint: "뷰티 쇼츠와 메이크업 추천 영상에서 반복 노출되는 주제",
  },
  {
    keyword: "1박2일 근교여행",
    category: "여행",
    query: "1박2일 근교여행",
    reasonHint: "주말 여행 브이로그와 여행 코스 추천 영상에서 빠르게 소비되는 주제",
  },
  {
    keyword: "제로슈가 레시피",
    category: "푸드",
    query: "제로슈가 레시피",
    reasonHint: "식단 관리와 다이어트 레시피 영상에서 연속적으로 노출되는 주제",
  },
  {
    keyword: "러닝 입문",
    category: "피트니스",
    query: "러닝 입문",
    reasonHint: "입문 운동 루틴과 챌린지형 숏폼에서 꾸준히 반복되는 주제",
  },
  {
    keyword: "생산성 데스크 셋업",
    category: "라이프",
    query: "생산성 데스크 셋업",
    reasonHint: "공부 브이로그와 업무 환경 개선 영상에서 함께 소비되는 주제",
  },
  {
    keyword: "AI 일정관리",
    category: "테크",
    query: "AI 일정관리",
    reasonHint: "생산성 도구 추천과 자동화 콘텐츠에서 관심이 이어지는 주제",
  },
];

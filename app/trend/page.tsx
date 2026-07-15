"use client";

import { useState } from "react";
import Link from "next/link";

import "./themes.css";

type Theme = "dark" | "editorial" | "fashion" | "news" | "insta" | "warm";

type Reason = {
  source: string;
  text: string;
};

type RelatedItem = {
  platform: string;
  title: string;
  metric: string;
  kind: string;
};

type TrendDetail = {
  rank: number;
  keyword: string;
  category: string;
  growth: string;
  velocity: string;
  score: number;
  detectedAgo: string;
  updatedAgo: string;
  summary: string;
  deck: string;
  pullquote: string;
  reasons: Reason[];
  series: number[];
  days: string[];
  related: RelatedItem[];
  keywords: string[];
  channels: string[];
};

const trend: TrendDetail = {
  rank: 1,
  keyword: "제로슈가 아이스티",
  category: "푸드",
  growth: "+182%",
  velocity: "9.1",
  score: 88,
  detectedAgo: "2시간 전",
  updatedAgo: "2시간 전",
  summary:
    "운동 루틴과 다이어트 브이로그에서 반복 노출되며 저장과 공유가 빠르게 늘고 있습니다. 짧은 레시피 영상과 체형관리 콘텐츠가 함께 묶이며 확산되는 흐름입니다.",
  deck: "레시피 릴스와 다이어트 브이로그가 맞물리며 저장·공유가 검색보다 먼저 반응하고 있다.",
  pullquote: "검색이 아니라 '저장'과 '공유'가 먼저 튀는 전형적인 급상승 패턴.",
  reasons: [
    { source: "Instagram Reels", text: '"10초 홈카페" 포맷 레시피 릴스가 저장 수 상위권에 반복 진입' },
    { source: "Facebook Groups", text: "다이어트·헬스 커뮤니티에서 제품 비교·후기 댓글이 급증" },
    { source: "YouTube Shorts", text: "체형관리 브이로그에 자연스럽게 삽입되며 연관 검색 동반 상승" },
  ],
  series: [22, 26, 24, 41, 58, 74, 100],
  days: ["월", "화", "수", "목", "금", "토", "일"],
  related: [
    { platform: "Instagram", title: "제로슈가 홈카페 3종 레시피", metric: "저장 12.4K", kind: "릴스" },
    { platform: "YouTube", title: "다이어트 중 음료 뭐 마셔?", metric: "조회 84만", kind: "쇼츠" },
    { platform: "Facebook", title: "제로 아이스티 실측 후기 모음", metric: "댓글 2.1K", kind: "그룹" },
  ],
  keywords: ["#다이어트음료", "#홈카페", "#저칼로리", "#제로슈가", "#여름음료", "#헬스간식"],
  channels: ["Instagram Reels", "Facebook Groups", "YouTube Shorts"],
};

const THEMES: { id: Theme; label: string }[] = [
  { id: "dark", label: "다크 애널리틱스" },
  { id: "editorial", label: "에디토리얼" },
  { id: "fashion", label: "패션 매거진" },
  { id: "news", label: "신문" },
  { id: "insta", label: "인스타" },
  { id: "warm", label: "웜" },
];

function platformGlyph(platform: string): string {
  switch (platform) {
    case "Instagram":
      return "IG";
    case "YouTube":
      return "▶";
    case "Facebook":
      return "f";
    default:
      return platform.slice(0, 2).toUpperCase();
  }
}

function platformClass(platform: string): string {
  return `td-thumb-${platform.toLowerCase()}`;
}

function commentHandle(source: string): string {
  return source.toLowerCase().replace(/\s+/g, "_");
}

function Spark({ series, days }: { series: number[]; days: string[] }) {
  const width = 320;
  const height = 120;
  const padX = 10;
  const padY = 14;
  const max = 100;
  const min = 0;
  const stepX = series.length > 1 ? (width - padX * 2) / (series.length - 1) : 0;

  const yFor = (value: number) => padY + (height - padY * 2) * (1 - (value - min) / (max - min));

  const points = series.map((value, index) => ({
    x: padX + index * stepX,
    y: yFor(value),
  }));

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");

  const floor = (height - padY).toFixed(1);
  const areaPath =
    points.length > 0
      ? `${linePath} L${points[points.length - 1].x.toFixed(1)},${floor} L${points[0].x.toFixed(1)},${floor} Z`
      : "";

  const gridValues = [75, 50, 25];
  const axisValues = [100, 50, 0];
  const last = points[points.length - 1] as { x: number; y: number } | undefined;

  return (
    <div className="td-spark">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="td-spark-svg"
        role="img"
        aria-label="최근 7일 관심 지표 추이 차트"
      >
        {gridValues.map((value) => (
          <line
            key={value}
            x1={padX}
            x2={width - padX}
            y1={yFor(value)}
            y2={yFor(value)}
            className="td-spark-grid"
          />
        ))}
        {axisValues.map((value) => (
          <text key={value} x={width - padX} y={yFor(value) - 3} className="td-spark-axis" textAnchor="end">
            {value}
          </text>
        ))}
        {areaPath && <path d={areaPath} className="td-spark-area" />}
        <path d={linePath} className="td-spark-line" />
        {last && <circle cx={last.x} cy={last.y} r={4} className="td-spark-dot" />}
      </svg>
      <div className="td-spark-days">
        {days.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
    </div>
  );
}

function DefaultLayout() {
  return (
    <div className="td-content">
      <div className="td-masthead" aria-hidden="true">
        <p className="td-masthead-title">THE TREND GAZETTE</p>
        <div className="td-masthead-edition">
          <span>제1호</span>
          <span>가격 무료</span>
          <span>서울 맑음 28°</span>
          <span>발행 TrendDrop</span>
        </div>
        <p className="td-dateline">2026년 7월 15일 · {trend.category}면</p>
      </div>

      <div className="td-topbar">
        <Link href="/" className="td-back">
          ← 트렌드 목록
        </Link>
        <span className="td-rank">#{trend.rank}</span>
        <span className="td-tag">{trend.category}</span>
      </div>

      <section className="td-hero">
        <span className="td-giant-rank" aria-hidden="true">
          0{trend.rank}
        </span>
        <p className="td-issue-line" aria-hidden="true">
          TRENDDROP — ISSUE 0{trend.rank}
        </p>
        <p className="td-kicker">{trend.category} · 분석</p>
        <h1 className="td-title">{trend.keyword}</h1>
        <p className="td-deck">{trend.deck}</p>
        <p className="td-byline">
          <span className="td-byline-default">분석 · {trend.detectedAgo}</span>
          <span className="td-byline-editorial">글 · TrendDrop 에디토리얼 · 읽는 시간 3분</span>
          <span className="td-byline-news">본지 트렌드팀 · {trend.detectedAgo}</span>
        </p>
        <span className="td-hot-sticker" aria-hidden="true">
          HOT
        </span>
      </section>

      <section className="td-metrics" aria-label="핵심 지표">
        <div className="td-stat">
          <span className="td-stat-value td-up">{trend.growth}</span>
          <span className="td-stat-label">검색 상승률</span>
        </div>
        <div className="td-stat">
          <span className="td-stat-value">
            {trend.velocity}
            <em>/10</em>
          </span>
          <span className="td-stat-label">확산 속도</span>
        </div>
        <div className="td-stat">
          <span className="td-stat-value">
            {trend.score}
            <em>/100</em>
          </span>
          <span className="td-stat-label">트렌드 점수</span>
        </div>
        <div className="td-stat">
          <span className="td-stat-value">{trend.detectedAgo}</span>
          <span className="td-stat-label">감지 시점</span>
        </div>
      </section>

      <section className="td-panel td-chart-panel">
        <h2 className="td-h2">상승 추이</h2>
        <Spark series={trend.series} days={trend.days} />
      </section>

      <section className="td-panel td-why-panel">
        <p className="td-eyebrow">AI 요약 · 왜 뜨나</p>
        <p className="td-summary">{trend.summary}</p>
        <blockquote className="td-pullquote">“{trend.pullquote}”</blockquote>
        <ol className="td-reasons">
          {trend.reasons.map((reason) => (
            <li key={reason.source}>
              <span className="td-reason-source">{reason.source}</span>
              <p>{reason.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="td-panel td-related-panel">
        <h2 className="td-h2">관련 콘텐츠</h2>
        <div className="td-related-grid">
          {trend.related.map((item) => (
            <article className="td-related-card" key={item.title}>
              <div className={`td-thumb ${platformClass(item.platform)}`}>
                <span>{platformGlyph(item.platform)}</span>
              </div>
              <div className="td-related-body">
                <p className="td-related-platform">
                  {item.platform} · {item.kind}
                </p>
                <p className="td-related-title">{item.title}</p>
                <p className="td-related-metric">{item.metric}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="td-panel td-keywords-panel">
        <h2 className="td-h2">연관 키워드</h2>
        <div className="td-chips">
          {trend.keywords.map((keyword) => (
            <span className="td-chip" key={keyword}>
              {keyword}
            </span>
          ))}
        </div>
      </section>

      <section className="td-panel td-channels-panel">
        <h2 className="td-h2">감지 채널</h2>
        <ul className="td-channel-list">
          {trend.channels.map((channel) => (
            <li key={channel}>
              <span className="td-live-dot" aria-hidden="true" />
              {channel}
            </li>
          ))}
        </ul>
      </section>

      <footer className="td-footer">마지막 갱신 {trend.updatedAgo} · 데이터는 예시(mock)입니다</footer>
    </div>
  );
}

function InstaLayout() {
  return (
    <div className="td-insta-page">
      <div className="td-insta-topbar">
        <Link href="/" className="td-back">
          ← 트렌드 목록
        </Link>
        <span className="td-insta-rank">
          #{trend.rank} · {trend.category}
        </span>
      </div>

      <div className="td-insta-card">
        <header className="td-insta-header">
          <div className="td-insta-avatar-ring">
            <span className="td-insta-avatar">🧋</span>
          </div>
          <div className="td-insta-handle">
            <strong>
              @trenddrop
              <span className="td-insta-verified" aria-label="인증됨">
                ✓
              </span>
            </strong>
            <span>{trend.category} 분석 계정</span>
          </div>
          <button type="button" className="td-insta-follow">
            팔로우
          </button>
        </header>

        <div className="td-insta-stories" role="list">
          {trend.keywords.map((keyword) => (
            <div className="td-insta-story" role="listitem" key={keyword}>
              <div className="td-insta-story-ring">
                <span>{keyword.replace("#", "").slice(0, 2)}</span>
              </div>
              <p>{keyword}</p>
            </div>
          ))}
        </div>

        <div className="td-insta-post-media">
          <Spark series={trend.series} days={trend.days} />
          <div className="td-insta-overlay">
            <p className="td-insta-overlay-title">{trend.keyword}</p>
            <span className="td-insta-overlay-value">{trend.growth}</span>
            <span className="td-insta-overlay-label">7일 관심 추이</span>
          </div>
        </div>

        <div className="td-insta-actions">
          <span className="td-insta-action-icons" aria-hidden="true">
            ♥ 🔖 📤
          </span>
          <p className="td-insta-likes">좋아요 12,480개</p>
        </div>

        <div className="td-insta-metrics">
          <span className="td-insta-metric">확산 {trend.velocity}/10</span>
          <span className="td-insta-metric">점수 {trend.score}/100</span>
          <span className="td-insta-metric">감지 {trend.detectedAgo}</span>
        </div>

        <div className="td-insta-caption">
          <p>
            <strong>@trenddrop</strong> {trend.summary}
          </p>
          <p className="td-insta-hashtags">{trend.keywords.join(" ")}</p>
          <button type="button" className="td-insta-more">
            더 보기
          </button>
          <p className="td-insta-timestamp">{trend.detectedAgo}</p>
        </div>

        <div className="td-insta-comments">
          <button type="button" className="td-insta-viewall">
            댓글 128개 모두 보기
          </button>
          {trend.reasons.map((reason) => (
            <p key={reason.source}>
              <strong>@{commentHandle(reason.source)}</strong> {reason.text}
            </p>
          ))}
        </div>

        <div className="td-insta-grid">
          {trend.related.map((item) => (
            <div className={`td-insta-grid-item ${platformClass(item.platform)}`} key={item.title}>
              <span className="td-insta-grid-initial">{platformGlyph(item.platform)}</span>
              <div className="td-insta-grid-overlay">{item.metric}</div>
            </div>
          ))}
        </div>

        <p className="td-insta-channels">감지 채널 · {trend.channels.join(" · ")}</p>
      </div>

      <footer className="td-footer td-insta-footer">
        마지막 갱신 {trend.updatedAgo} · 데이터는 예시(mock)입니다
      </footer>
    </div>
  );
}

export default function TrendDetailPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const activeLabel = THEMES.find((item) => item.id === theme)?.label ?? "";

  return (
    <div className={`td t-${theme}`}>
      <div className="td-switcher-bar">
        <div className="td-switcher-wrap">
          <span className="td-switcher-caption">
            테마 미리보기<em>{activeLabel}</em>
          </span>
          <div className="td-switcher" role="group" aria-label="상세 페이지 테마 전환">
            {THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                className="td-switcher-btn"
                aria-pressed={theme === item.id}
                onClick={() => setTheme(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {theme === "insta" ? <InstaLayout key={theme} /> : <DefaultLayout key={theme} />}
    </div>
  );
}

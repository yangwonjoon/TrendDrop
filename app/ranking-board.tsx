"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getRankDelta, type TrendItem } from "@/lib/trend-data";

type Period = "realtime" | "daily";

type Props = {
  realtime: TrendItem[];
  daily: TrendItem[];
  categories: string[];
  updatedLabel: string;
};

const PERIODS: { id: Period; label: string }[] = [
  { id: "realtime", label: "실시간" },
  { id: "daily", label: "24시간" },
];

function MiniSpark({ points }: { points: number[] }) {
  const width = 64;
  const height = 22;
  const stepX = points.length > 1 ? width / (points.length - 1) : 0;

  const d = points
    .map((value, index) => {
      const x = index * stepX;
      const y = height - (value / 100) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="rank-spark" viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeltaBadge({ item }: { item: TrendItem }) {
  const delta = getRankDelta(item);

  if (delta.kind === "new") {
    return <span className="rank-delta is-new">NEW</span>;
  }
  if (delta.kind === "up") {
    return (
      <span className="rank-delta is-up">
        <span aria-hidden="true">▲</span>
        {delta.diff}
        <span className="sr-only">단계 상승</span>
      </span>
    );
  }
  if (delta.kind === "down") {
    return (
      <span className="rank-delta is-down">
        <span aria-hidden="true">▼</span>
        {delta.diff}
        <span className="sr-only">단계 하락</span>
      </span>
    );
  }
  return (
    <span className="rank-delta is-same">
      <span aria-hidden="true">−</span>
      <span className="sr-only">변동 없음</span>
    </span>
  );
}

export default function RankingBoard({ realtime, daily, categories, updatedLabel }: Props) {
  const [period, setPeriod] = useState<Period>("realtime");
  const [category, setCategory] = useState<string>("전체");

  const items = period === "realtime" ? realtime : daily;

  const visible = useMemo(
    () => (category === "전체" ? items : items.filter((item) => item.category === category)),
    [items, category],
  );

  return (
    <section className="board" aria-labelledby="board-title">
      <div className="board-header">
        <div className="board-title-row">
          <h1 id="board-title" className="board-title">
            실시간 트렌드
          </h1>
          <span className="live-badge">
            <span className="live-dot" aria-hidden="true" />
            LIVE
          </span>
        </div>
        <p className="board-updated">{updatedLabel}</p>
      </div>

      <div className="board-controls">
        <div className="period-toggle" role="group" aria-label="집계 기간">
          {PERIODS.map((option) => (
            <button
              key={option.id}
              type="button"
              className="period-button"
              aria-pressed={period === option.id}
              onClick={() => setPeriod(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="category-tabs" role="group" aria-label="카테고리 필터">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              className="category-tab"
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="board-empty">선택한 카테고리에 해당하는 트렌드가 아직 없습니다.</p>
      ) : (
        <ol className="rank-list">
          {visible.map((item) => (
            <li key={`${item.keyword}-${item.rank}`} className="rank-row">
              <Link href="/trend" className="rank-link">
                <span className={`rank-num${item.rank <= 3 ? " is-top" : ""}`}>{item.rank}</span>

                <span className="rank-main">
                  <span className="rank-keyword">{item.keyword}</span>
                  <span className="rank-cat">{item.category}</span>
                </span>

                {item.spark ? <MiniSpark points={item.spark} /> : null}

                <DeltaBadge item={item} />

                <span className="rank-growth">{item.growth}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

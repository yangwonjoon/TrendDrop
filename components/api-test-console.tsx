"use client";

import { useState } from "react";

type TrendResponseItem = {
  rank: number;
  keyword: string;
  category: string;
  growth: string;
  velocity: string;
  source: string;
  summary: string;
  reason: string;
  sourceUrl?: string;
};

type ApiState = {
  label: string;
  status: "idle" | "loading" | "success" | "error";
  response: unknown;
};

const initialState: ApiState = {
  label: "아직 호출 전",
  status: "idle",
  response: null,
};

const collectionActions = [
  {
    label: "YouTube Data API 수집",
    description: "공개 영상 검색과 조회수 기반으로 트렌드 후보를 저장합니다.",
    endpoint: "/api/admin/collect/youtube",
    method: "POST",
  },
  {
    label: "Google News RSS 미리보기",
    description: "키워드별 최신 뉴스 묶음을 저장 없이 바로 확인합니다.",
    endpoint: "/api/google-news/preview",
    method: "GET",
  },
  {
    label: "Google News RSS 저장",
    description: "뉴스 기반 트렌드 후보를 Neon DB에 저장합니다.",
    endpoint: "/api/admin/collect/google-news",
    method: "POST",
  },
] as const;

export function ApiTestConsole() {
  const [apiState, setApiState] = useState<ApiState>(initialState);
  const [trends, setTrends] = useState<TrendResponseItem[]>([]);

  async function runRequest(
    label: string,
    input: RequestInfo | URL,
    init?: RequestInit,
    onSuccess?: (data: unknown) => void
  ) {
    setApiState({
      label,
      status: "loading",
      response: null,
    });

    try {
      const response = await fetch(input, init);
      const data = (await response.json()) as unknown;

      if (!response.ok) {
        setApiState({
          label,
          status: "error",
          response: data,
        });
        return;
      }

      onSuccess?.(data);
      setApiState({
        label,
        status: "success",
        response: data,
      });
    } catch (error) {
      setApiState({
        label,
        status: "error",
        response: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  return (
    <div className="api-lab-layout">
      <section className="panel api-action-panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">TREND SOURCES</p>
            <h3>외부 트렌드 수집 테스트</h3>
          </div>
        </div>

        <div className="google-api-grid">
          {collectionActions.map((action) => (
            <button
              className="api-provider-button"
              key={action.endpoint}
              onClick={() =>
                runRequest(action.label, action.endpoint, {
                  method: action.method,
                })
              }
              type="button"
            >
              <span>{action.label}</span>
              <small>{action.description}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel api-action-panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">PROJECT DATA</p>
            <h3>DB 및 저장 데이터</h3>
          </div>
        </div>

        <div className="api-action-grid">
          <button
            className="primary-button api-action-button"
            onClick={() => runRequest("전체 설정 상태", "/api/db/status")}
            type="button"
          >
            전체 설정 상태 확인
          </button>
          <button
            className="secondary-button api-action-button"
            onClick={() =>
              runRequest("DB 테이블 생성", "/api/admin/db/setup", {
                method: "POST",
              })
            }
            type="button"
          >
            DB 테이블 생성
          </button>
          <button
            className="secondary-button api-action-button"
            onClick={() =>
              runRequest("저장된 트렌드 조회", "/api/trends", undefined, (data) => {
                const trendData = (data as { data?: TrendResponseItem[] }).data ?? [];
                setTrends(trendData);
              })
            }
            type="button"
          >
            저장된 트렌드 조회
          </button>
        </div>
      </section>

      <section className="panel api-response-panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">RAW RESPONSE</p>
            <h3>{apiState.label}</h3>
          </div>
          <span className={`api-status-chip api-status-${apiState.status}`}>
            {apiState.status}
          </span>
        </div>
        <pre className="api-response-box">
          <code>{JSON.stringify(apiState.response, null, 2) || "응답 결과가 여기에 표시됩니다."}</code>
        </pre>
      </section>

      <section className="panel api-trend-panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">TREND PREVIEW</p>
            <h3>저장된 트렌드 데이터</h3>
          </div>
        </div>

        {trends.length ? (
          <div className="trend-grid api-trend-grid">
            {trends.map((trend) => (
              <article className="trend-card" key={`${trend.keyword}-${trend.rank}`}>
                <div className="trend-head">
                  <div>
                    <div className="trend-rank">#{trend.rank}</div>
                    <h3>{trend.keyword}</h3>
                  </div>
                  <span className="trend-tag">{trend.category}</span>
                </div>
                <p className="trend-meta">{trend.summary}</p>
                <div className="trend-stats">
                  <div className="stat-block">
                    <div className="stat-value">{trend.growth}</div>
                    <p className="stat-label">상승 지표</p>
                  </div>
                  <div className="stat-block">
                    <div className="stat-value">{trend.velocity}</div>
                    <p className="stat-label">확산 속도</p>
                  </div>
                </div>
                <p className="trend-meta">
                  <strong>왜 뜨나:</strong> {trend.reason}
                </p>
                <p className="trend-source">출처: {trend.source}</p>
                {trend.sourceUrl ? (
                  <a
                    className="trend-source-link"
                    href={trend.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    원본 보기
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state-box">
            <p>아직 조회된 트렌드가 없습니다. `저장된 트렌드 조회` 버튼으로 결과를 확인해 보세요.</p>
          </div>
        )}
      </section>
    </div>
  );
}

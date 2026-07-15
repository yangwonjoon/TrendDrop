import { desc, eq, sql } from "drizzle-orm";

import { getDb, isDbConfigured } from "@/db";
import { keywords, sources, trendSnapshots } from "@/db/schema";
import { trends as mockTrends } from "@/lib/trend-data";

export async function getTrendFeed(category?: string) {
  if (!isDbConfigured()) {
    return {
      data:
        category && category !== "전체"
          ? mockTrends.filter((trend) => trend.category === category)
          : mockTrends,
      meta: {
        source: "mock",
        dbConnected: false,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  const db = getDb();
  const rows = await db
    .select({
      keyword: keywords.term,
      category: keywords.category,
      growth: trendSnapshots.growthRate,
      velocity: trendSnapshots.velocity,
      summary: trendSnapshots.summary,
      reason: trendSnapshots.reason,
      source: trendSnapshots.sourceLabel,
      score: trendSnapshots.score,
      capturedAt: trendSnapshots.capturedAt,
      sourceName: sources.name,
      sourceUrl: trendSnapshots.sourceUrl,
    })
    .from(trendSnapshots)
    .innerJoin(keywords, eq(trendSnapshots.keywordId, keywords.id))
    .leftJoin(sources, eq(keywords.sourceId, sources.id))
    .where(category && category !== "전체" ? eq(keywords.category, category) : sql`true`)
    .orderBy(desc(trendSnapshots.capturedAt), desc(trendSnapshots.score))
    .limit(30);

  return {
    data: rows.map((row, index) => ({
      rank: index + 1,
      keyword: row.keyword,
      category: row.category,
      growth: row.growth ?? "-",
      velocity: row.velocity ?? "-",
      source: row.source ?? row.sourceName ?? "Unknown",
      summary: row.summary ?? "",
      reason: row.reason ?? "",
      sourceUrl: row.sourceUrl ?? "",
    })),
    meta: {
      source: "neon",
      dbConnected: true,
      updatedAt: rows[0]?.capturedAt?.toISOString() ?? new Date().toISOString(),
    },
  };
}

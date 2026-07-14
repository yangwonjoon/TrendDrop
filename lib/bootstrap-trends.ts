import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { keywords, sources, trendSnapshots } from "@/db/schema";
import { trends } from "@/lib/trend-data";

export async function bootstrapMockTrendData() {
  const db = getDb();

  const [googleSource] = await db
    .insert(sources)
    .values({
      name: "YouTube Data API",
      kind: "google",
    })
    .onConflictDoUpdate({
      target: sources.name,
      set: { kind: "google" },
    })
    .returning();

  let insertedCount = 0;

  for (const trend of trends) {
    const [keyword] = await db
      .insert(keywords)
      .values({
        term: trend.keyword,
        category: trend.category,
        sourceId: googleSource.id,
      })
      .onConflictDoUpdate({
        target: keywords.term,
        set: {
          category: trend.category,
          sourceId: googleSource.id,
        },
      })
      .returning();

    const existingSnapshot = await db
      .select({ id: trendSnapshots.id })
      .from(trendSnapshots)
      .where(eq(trendSnapshots.keywordId, keyword.id))
      .limit(1);

    if (!existingSnapshot.length) {
      await db.insert(trendSnapshots).values({
        keywordId: keyword.id,
        score: 100 - trend.rank,
        growthRate: trend.growth,
        velocity: trend.velocity,
        summary: trend.summary,
        reason: trend.reason,
        sourceLabel: trend.source,
      });
      insertedCount += 1;
    }
  }

  return {
    insertedCount,
    totalKeywords: trends.length,
  };
}

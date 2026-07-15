import { getDb } from "@/db";
import { keywords, sources, trendSnapshots } from "@/db/schema";
import { googleNewsSeedQueries, searchGoogleNewsRss } from "@/lib/google-news-rss";

function newsVelocity(index: number) {
  return `${Math.max(4, 10 - index).toFixed(1)}/10`;
}

export async function collectGoogleNewsTrends() {
  const db = getDb();
  const [source] = await db
    .insert(sources)
    .values({
      name: "Google News RSS",
      kind: "google-news",
    })
    .onConflictDoUpdate({
      target: sources.name,
      set: { kind: "google-news" },
    })
    .returning();

  const newsGroups = await Promise.all(
    googleNewsSeedQueries.map(async (seed) => ({
      ...seed,
      items: await searchGoogleNewsRss(seed.keyword),
    }))
  );
  const results = [];

  for (const group of newsGroups) {
    const items = group.items;
    const topItem = items[0];

    if (!topItem) {
      continue;
    }

    const [keyword] = await db
      .insert(keywords)
      .values({
        term: group.keyword,
        category: group.category,
        sourceId: source.id,
      })
      .onConflictDoUpdate({
        target: keywords.term,
        set: {
          category: group.category,
          sourceId: source.id,
        },
      })
      .returning();

    await db.insert(trendSnapshots).values({
      keywordId: keyword.id,
      score: Math.min(100, 60 + items.length * 6),
      growthRate: `뉴스 ${items.length}건`,
      velocity: newsVelocity(results.length),
      summary: topItem.title,
      reason: "Google News RSS에서 관련 기사 묶음이 확인된 공개 이슈입니다.",
      sourceLabel: `Google News · ${topItem.source}`,
      externalRef: `google-news:${group.keyword}`,
      sourceUrl: topItem.link,
    });

    results.push({
      keyword: group.keyword,
      category: group.category,
      headline: topItem.title,
      source: topItem.source,
      link: topItem.link,
      articleCount: items.length,
    });
  }

  return {
    collected: results.length,
    items: results,
  };
}

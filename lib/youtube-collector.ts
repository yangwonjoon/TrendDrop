import { getDb } from "@/db";
import { keywords, sources, trendSnapshots } from "@/db/schema";
import { hasYoutubeApiKey } from "@/lib/env";
import { getYoutubeVideoStats, searchYoutubeVideos } from "@/lib/youtube-api";
import { youtubeSeedQueries } from "@/lib/youtube-seed-queries";

function formatCompactMetric(value: number) {
  if (value >= 1_000_000) {
    return `+${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `+${Math.round(value / 1_000)}K`;
  }
  return `+${value}`;
}

function computeVelocity(viewCount: number, likeCount: number, commentCount: number) {
  const score = Math.min(
    10,
    viewCount / 150_000 + likeCount / 15_000 + commentCount / 1_500
  );
  return `${score.toFixed(1)}/10`;
}

export async function collectYoutubeSeedTrends() {
  if (!hasYoutubeApiKey()) {
    throw new Error("YOUTUBE_API_KEY is not configured");
  }

  const db = getDb();
  const [source] = await db
    .insert(sources)
    .values({
      name: "YouTube Data API",
      kind: "google-youtube",
    })
    .onConflictDoUpdate({
      target: sources.name,
      set: { kind: "google-youtube" },
    })
    .returning();

  const results = [];

  for (const seed of youtubeSeedQueries) {
    const videos = await searchYoutubeVideos(seed.query);
    const videoIds = videos
      .map((video) => video.id.videoId)
      .filter((videoId): videoId is string => Boolean(videoId));

    const stats = await getYoutubeVideoStats(videoIds);
    const topVideo = videos[0];
    const topStats = stats[0];

    if (!topVideo || !topStats) {
      continue;
    }

    const viewCount = Number(topStats.statistics?.viewCount ?? "0");
    const likeCount = Number(topStats.statistics?.likeCount ?? "0");
    const commentCount = Number(topStats.statistics?.commentCount ?? "0");

    const [keyword] = await db
      .insert(keywords)
      .values({
        term: seed.keyword,
        category: seed.category,
        sourceId: source.id,
      })
      .onConflictDoUpdate({
        target: keywords.term,
        set: {
          category: seed.category,
          sourceId: source.id,
        },
      })
      .returning();

    await db.insert(trendSnapshots).values({
      keywordId: keyword.id,
      score: Math.min(100, Math.round(viewCount / 20_000 + likeCount / 2_000)),
      growthRate: formatCompactMetric(viewCount),
      velocity: computeVelocity(viewCount, likeCount, commentCount),
      summary:
        topVideo.snippet.description?.slice(0, 180) ||
        `${topVideo.snippet.channelTitle} 채널에서 반응이 확인된 영상 주제입니다.`,
      reason: seed.reasonHint,
      sourceLabel: `YouTube · ${topVideo.snippet.channelTitle}`,
      externalRef: topStats.id,
      sourceUrl: `https://www.youtube.com/watch?v=${topStats.id}`,
    });

    results.push({
      keyword: seed.keyword,
      videoId: topStats.id,
      viewCount,
      likeCount,
      commentCount,
    });
  }

  return {
    collected: results.length,
    items: results,
  };
}

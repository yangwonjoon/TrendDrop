import { getYoutubeApiKey } from "@/lib/env";

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";
const YOUTUBE_API_TIMEOUT_MS = 15_000;

type YoutubeSearchItem = {
  id: { videoId?: string };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    channelTitle: string;
  };
};

type YoutubeVideoItem = {
  id: string;
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
};

type YoutubeSearchResponse = {
  items?: YoutubeSearchItem[];
};

type YoutubeVideosResponse = {
  items?: YoutubeVideoItem[];
};

async function youtubeFetch<T>(url: string, params: Record<string, string>) {
  const searchParams = new URLSearchParams({
    key: getYoutubeApiKey(),
    ...params,
  });

  const response = await fetch(`${url}?${searchParams.toString()}`, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(YOUTUBE_API_TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`YouTube API request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

export async function searchYoutubeVideos(query: string) {
  const data = await youtubeFetch<YoutubeSearchResponse>(YOUTUBE_SEARCH_URL, {
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "5",
    order: "viewCount",
    regionCode: "KR",
    relevanceLanguage: "ko",
    publishedAfter: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  });

  return data.items ?? [];
}

export async function getYoutubeVideoStats(videoIds: string[]) {
  if (!videoIds.length) {
    return [];
  }

  const data = await youtubeFetch<YoutubeVideosResponse>(YOUTUBE_VIDEOS_URL, {
    part: "statistics",
    id: videoIds.join(","),
    maxResults: String(videoIds.length),
  });

  return data.items ?? [];
}

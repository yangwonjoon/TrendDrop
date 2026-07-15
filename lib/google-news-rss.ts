const GOOGLE_NEWS_RSS_URL = "https://news.google.com/rss/search";
const GOOGLE_NEWS_TIMEOUT_MS = 15_000;

export const googleNewsSeedQueries = [
  { keyword: "인스타그램 트렌드", category: "소셜" },
  { keyword: "유튜브 쇼츠", category: "영상" },
  { keyword: "틱톡 챌린지", category: "소셜" },
  { keyword: "AI 서비스", category: "테크" },
  { keyword: "패션 트렌드", category: "라이프스타일" },
  { keyword: "K팝 이슈", category: "엔터" },
] as const;

type GoogleNewsItem = {
  title: string;
  link: string;
  publishedAt: string | null;
  source: string;
};

function decodeXml(value: string) {
  return value
    .replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .trim();
}

function getTagValue(itemXml: string, tagName: string) {
  const pattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = itemXml.match(pattern);

  return match ? decodeXml(match[1]) : "";
}

function parseGoogleNewsRss(xml: string): GoogleNewsItem[] {
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

  return itemMatches.map((itemXml) => ({
    title: getTagValue(itemXml, "title"),
    link: getTagValue(itemXml, "link"),
    publishedAt: getTagValue(itemXml, "pubDate") || null,
    source: getTagValue(itemXml, "source") || "Google News",
  }));
}

export async function searchGoogleNewsRss(query: string) {
  const params = new URLSearchParams({
    q: query,
    hl: "ko",
    gl: "KR",
    ceid: "KR:ko",
  });

  const response = await fetch(`${GOOGLE_NEWS_RSS_URL}?${params.toString()}`, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(GOOGLE_NEWS_TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google News RSS request failed (${response.status}): ${text}`);
  }

  const xml = await response.text();
  return parseGoogleNewsRss(xml).slice(0, 5);
}

export async function previewGoogleNewsTrends() {
  const results = await Promise.all(
    googleNewsSeedQueries.map(async (seed) => {
    const items = await searchGoogleNewsRss(seed.keyword);
      return {
      ...seed,
      items,
      };
    })
  );

  return {
    source: "Google News RSS",
    collected: results.reduce((sum, result) => sum + result.items.length, 0),
    groups: results,
  };
}

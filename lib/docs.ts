import fs from "node:fs/promises";
import path from "node:path";

export type DocEntry = {
  slug: string;
  title: string;
  description: string;
  filePath: string;
};

export const docs: DocEntry[] = [
  {
    slug: "trend-services-research",
    title: "트렌드 서비스 조사",
    description: "해외/국내 사례, 차별점, MVP 우선순위를 정리한 리서치 문서",
    filePath: "trend-services-research.md",
  },
  {
    slug: "google-api-research",
    title: "Google API 조사",
    description: "TrendDrop에 맞는 Google 계열 API 후보, 쿼터, 트래픽, 리스크를 정리한 문서",
    filePath: "google-api-research.md",
  },
];

const docsDir = path.join(process.cwd(), "docs");

export function getDocList() {
  return docs;
}

export function getDocBySlug(slug: string) {
  return docs.find((entry) => entry.slug === slug) ?? null;
}

export async function readDocContent(slug: string) {
  const doc = getDocBySlug(slug);

  if (!doc) {
    return null;
  }

  const fullPath = path.join(docsDir, doc.filePath);
  const content = await fs.readFile(fullPath, "utf8");

  return {
    ...doc,
    content,
  };
}


import { NextResponse } from "next/server";

import { previewGoogleNewsTrends } from "@/lib/google-news-rss";

export async function GET() {
  try {
    const result = await previewGoogleNewsTrends();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Google News RSS preview failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

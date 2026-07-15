import { NextResponse } from "next/server";

import { isDbConfigured } from "@/db";
import { hasYoutubeApiKey } from "@/lib/env";
import { collectYoutubeSeedTrends } from "@/lib/youtube-collector";

export async function POST() {
  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        error: "DATABASE_URL is not configured",
      },
      { status: 400 }
    );
  }

  if (!hasYoutubeApiKey()) {
    return NextResponse.json(
      {
        error: "YOUTUBE_API_KEY is not configured",
      },
      { status: 400 }
    );
  }

  try {
    const result = await collectYoutubeSeedTrends();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "YouTube collection failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

import { isDbConfigured } from "@/db";
import { collectGoogleNewsTrends } from "@/lib/google-news-collector";

export async function POST() {
  if (!isDbConfigured()) {
    return NextResponse.json(
      {
        error: "DATABASE_URL is not configured",
      },
      { status: 400 }
    );
  }

  try {
    const result = await collectGoogleNewsTrends();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "Google News RSS collection failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

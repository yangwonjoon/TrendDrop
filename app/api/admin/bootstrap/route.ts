import { NextResponse } from "next/server";

import { isDbConfigured } from "@/db";
import { bootstrapMockTrendData } from "@/lib/bootstrap-trends";

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
    const result = await bootstrapMockTrendData();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Bootstrap failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

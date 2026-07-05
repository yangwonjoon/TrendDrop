import { NextResponse } from "next/server";

import { trends } from "@/lib/trend-data";

export async function GET() {
  return NextResponse.json({
    data: trends,
    meta: {
      source: "mock",
      updatedAt: new Date().toISOString(),
    },
  });
}


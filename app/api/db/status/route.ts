import { NextResponse } from "next/server";

import { isDbConfigured } from "@/db";

export async function GET() {
  return NextResponse.json({
    configured: isDbConfigured(),
    provider: "neon-postgres",
  });
}

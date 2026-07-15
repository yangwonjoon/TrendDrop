import { NextResponse } from "next/server";

import { isDbConfigured } from "@/db";
import { hasYoutubeApiKey } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    configured: isDbConfigured(),
    youtubeConfigured: hasYoutubeApiKey(),
    provider: "neon-postgres",
    integrations: {
      youtubeDataApi: hasYoutubeApiKey(),
      googleNewsRss: true,
    },
  });
}

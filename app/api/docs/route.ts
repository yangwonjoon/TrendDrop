import { NextResponse } from "next/server";

import { getDocList } from "@/lib/docs";

export async function GET() {
  return NextResponse.json({
    data: getDocList(),
  });
}


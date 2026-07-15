import { NextResponse } from "next/server";

import { ensureDatabaseTables } from "@/lib/db-setup";

export async function POST() {
  try {
    const result = await ensureDatabaseTables();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Database setup failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

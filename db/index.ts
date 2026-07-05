import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseUrl } from "@/lib/env";

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    const client = postgres(getDatabaseUrl(), {
      prepare: false,
      max: 1,
    });

    dbInstance = drizzle(client);
  }

  return dbInstance;
}


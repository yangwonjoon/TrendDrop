import postgres from "postgres";

import { trends } from "./trend-seed-data.mjs";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not configured");
  process.exit(1);
}

const sql = postgres(databaseUrl, {
  prepare: false,
  max: 1,
});

try {
  const [source] = await sql`
    insert into sources (name, kind)
    values ('YouTube Data API', 'google')
    on conflict (name) do update set kind = excluded.kind
    returning id;
  `;

  let insertedCount = 0;

  for (const trend of trends) {
    const [keyword] = await sql`
      insert into keywords (term, category, source_id)
      values (${trend.keyword}, ${trend.category}, ${source.id})
      on conflict (term) do update
      set category = excluded.category,
          source_id = excluded.source_id
      returning id;
    `;

    const existing = await sql`
      select id
      from trend_snapshots
      where keyword_id = ${keyword.id}
      limit 1;
    `;

    if (!existing.length) {
      await sql`
        insert into trend_snapshots (
          keyword_id,
          score,
          growth_rate,
          velocity,
          summary,
          reason,
          source_label
        ) values (
          ${keyword.id},
          ${100 - trend.rank},
          ${trend.growth},
          ${trend.velocity},
          ${trend.summary},
          ${trend.reason},
          ${trend.source}
        );
      `;
      insertedCount += 1;
    }
  }

  console.log("Seed completed");
  console.log({
    insertedCount,
    totalKeywords: trends.length,
  });
} catch (error) {
  console.error("Seed failed");
  console.error(error);
  process.exitCode = 1;
} finally {
  await sql.end();
}

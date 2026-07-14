import postgres from "postgres";

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
  await sql`
    create table if not exists sources (
      id integer generated always as identity primary key,
      name varchar(80) not null unique,
      kind varchar(40) not null,
      created_at timestamptz not null default now()
    );
  `;

  await sql`
    create table if not exists keywords (
      id integer generated always as identity primary key,
      term varchar(160) not null unique,
      category varchar(80) not null,
      source_id integer references sources(id),
      created_at timestamptz not null default now()
    );
  `;

  await sql`
    create table if not exists trend_snapshots (
      id integer generated always as identity primary key,
      keyword_id integer not null references keywords(id),
      score integer,
      growth_rate varchar(32),
      velocity varchar(32),
      summary text,
      reason text,
      source_label varchar(200),
      captured_at timestamptz not null default now()
    );
  `;

  console.log("Database tables created or already present");
} catch (error) {
  console.error("Database setup failed");
  console.error(error);
  process.exitCode = 1;
} finally {
  await sql.end();
}

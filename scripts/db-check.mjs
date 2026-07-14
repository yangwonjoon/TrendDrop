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
  const result = await sql`select now() as now`;
  console.log("Database connection ok");
  console.log(result);
} catch (error) {
  console.error("Database connection failed");
  console.error(error);
  process.exitCode = 1;
} finally {
  await sql.end();
}

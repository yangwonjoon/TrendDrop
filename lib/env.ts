function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDatabaseUrl() {
  return requireEnv("DATABASE_URL");
}

export function hasYoutubeApiKey() {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

export function getYoutubeApiKey() {
  return requireEnv("YOUTUBE_API_KEY");
}

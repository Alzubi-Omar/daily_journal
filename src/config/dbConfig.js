/**
 * PostgreSQL database configuration object.
 *
 * Guards against missing DATABASE_URL before attempting URL parsing —
 * prevents an unhandled exception if the env var is absent at startup.
 *
 * @module config/dbConfig
 */

if (!process.env.DATABASE_URL) {
  console.error("[FATAL] Missing required environment variable: DATABASE_URL");
  process.exit(1);
}

const dbUrl = new URL(process.env.DATABASE_URL);

export const dbConfig = {
  user: dbUrl.username,
  host: dbUrl.hostname,
  database: dbUrl.pathname.slice(1),
  password: dbUrl.password,
  port: dbUrl.port || 5432,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : false,
};

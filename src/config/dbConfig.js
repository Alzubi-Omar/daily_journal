/**
 * PostgreSQL database configuration object.
 * @constant {Object} dbConfig - Configuration object for PostgreSQL connection.
 * @description Configures the connection to a PostgreSQL database using the `DATABASE_URL` environment variable.
 * Automatically adapts to production and non-production environments for SSL settings.
 */
const dbUrl = new URL(process.env.DATABASE_URL);

// Extract individual parts from the DATABASE_URL
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

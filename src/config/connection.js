import pkg from "pg";
const { Pool } = pkg;
import { dbConfig } from "./dbConfig.js";
import logger from "../utils/logger.js";

/**
 * @constant {Pool} pool - PostgreSQL connection pool instance.
 * @description Creates and exports a connection pool for querying the PostgreSQL database.
 * - Configures connection pool using environment variables
 * - Handles connection errors and graceful shutdown
 * - Logs connection details and environment status
 */

// Create the connection pool
const pool = new Pool(dbConfig);

// Log environment and connection details
logger.info(`Running in ${process.env.NODE_ENV} mode`);
logger.info(`Connected to database: ${dbConfig.database} on ${dbConfig.host}`);

// Error Handling
pool.on("error", (err) => {
  logger.error("Unexpected error on idle client", err);
  process.exit(1);
});

// Gracefully shut down the pool when the app is terminated
process.on("SIGINT", async () => {
  logger.info("Shutting down database connection pool...");
  await pool.end();
  logger.info("Database connection pool closed.");
  process.exit(0);
});

export default pool;

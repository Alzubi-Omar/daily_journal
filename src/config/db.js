import pool from "./connection.js";
import logger from "../utils/logger.js";

/**
 * Starts the server, connects to the PostgreSQL database, and ensures the 'posts' table exists.
 *
 * This function does the following:
 * - Establishes a connection to the PostgreSQL database using a connection pool.
 * - Creates the 'posts' table if it doesn't exist.
 * - Releases the database connection after the operation.
 *
 * @async
 * @function startServer
 * @throws {Error} If the connection to the database fails, the application exits with an error.
 */
async function initializeDatabase() {
  try {
    // Validate pool
    if (!pool) throw new Error("Database pool is not initialized.");

    // Connect to the database
    const client = await pool.connect();
    logger.info("Connected to the database.");

    // Create the 'posts' table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.posts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        passkey VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    logger.info("Ensured the 'posts' table exists.");

    client.release();
  } catch (err) {
    logger.error("Database initialization failed:", err);
    process.exit(1);
  }
}

export default initializeDatabase;

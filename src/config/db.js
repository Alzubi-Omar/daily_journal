import pool from "./connection.js";
import logger from "../utils/logger.js";

/**
 * Initializes the database by ensuring the posts table exists.
 * Called once at server startup.
 *
 * @async
 * @function initializeDatabase
 * @throws {Error} Exits the process if the database cannot be reached.
 */
async function initializeDatabase() {
  let client;
  try {
    client = await pool.connect();
    logger.info("Connected to the database.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.posts (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        passkey    VARCHAR(255) NOT NULL,
        title      VARCHAR(255) NOT NULL,
        content    TEXT         NOT NULL,
        created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      );
    `);

    logger.info("Ensured the 'posts' table exists.");
  } catch (err) {
    logger.error(`Database initialization failed: ${err.message}`);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

export { pool };
export default initializeDatabase;

import pkg from "pg";
const { Pool } = pkg;
import { dbConfig } from "./dbConfig.js";
import logger from "../utils/logger.js";

/**
 * PostgreSQL connection pool.
 * Exported so index.js can call pool.end() during graceful shutdown.
 */
const pool = new Pool(dbConfig);

logger.info(`Running in ${process.env.NODE_ENV} mode`);
logger.info(`Connected to database: ${dbConfig.database} on ${dbConfig.host}`);

pool.on("error", (err) => {
  logger.error(`Unexpected error on idle database client: ${err.message}`);
});

export default pool;

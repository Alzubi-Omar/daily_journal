/**
 * @fileoverview Custom logging utility with timestamp and environment-aware logging
 * @module logger
 * @description Provides structured logging with:
 */
const logger = {
  info: (message) =>
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`),

  warn: (message) =>
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`),

  error: (message) =>
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`),

  // (for development only)
  debug: (message) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  },
};

export default logger;

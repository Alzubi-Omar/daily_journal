import logger from "./logger.js";

/**
 * @fileoverview Centralized error handling utility.
 *
 * Logs the error and renders the error page with an appropriate message.
 * Error details are only exposed in development mode.
 *
 * @module utils/errorHandler
 */
export const errorHandler = {
  renderError(res, status, message, error) {
    const detail =
      process.env.NODE_ENV === "development" && error
        ? ` — ${error.message}`
        : "";

    logger.error(`Error [${status}]: ${message}${detail}`);

    res.status(status).render("pages/error", {
      meta: { title: "Error - Daily Journal" },
      error: message || "An unexpected error occurred. Please try again later.",
      details:
        process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  },
};

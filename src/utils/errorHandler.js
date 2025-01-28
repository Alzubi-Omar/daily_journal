import logger from "./logger.js";

/**
 * @module errorHandler
 * @description Handles errors by logging them and rendering an error page for *              the user.
 *
 * Log the error details for debugging.
 * Default error message if none provided
 * Render the error page
 */

export const errorHandler = {
  renderError(res, status, message, error) {
    logger.error(`Error occurred: ${message}`, {
      status,
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });

    const userMessage =
      message || "An unexpected error occurred. Please try again later.";

    res.status(status).render("pages/error", {
      meta: { title: "Error - Daily Journal" },
      error: userMessage,
      details:
        process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  },
};

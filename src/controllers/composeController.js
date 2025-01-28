import logger from "../utils/logger.js";
import { errorHandler } from "../utils/errorHandler.js";

/**
 * Renders the Compose page for creating new posts.
 * Handles errors by rendering an error page.
 *
 * @async
 * @function renderComposePage
 */
export async function renderComposePage(req, res) {
  try {
    res.render("pages/compose", {
      meta: {
        title: "Compose - Daily Journal",
        description:
          "Create a new post and share your thoughts with the world.",
      },
      styles: ["compose"],
      messages: req.flash(),
    });
    logger.info("Successfully rendered the compose page");
  } catch (error) {
    logger.error("Error rendering compose page:", error);
    errorHandler.renderError(
      res,
      500,
      "An error occurred. Please try again later.",
      error
    );
  }
}

import logger from "../utils/logger.js";
import constants from "../utils/constants.js";
import { errorHandler } from "../utils/errorHandler.js";

/**
 * Renders the About page with dynamic content.
 * Handles errors by rendering an error page.
 *
 * @async
 * @function renderAboutPage
 */

export async function renderAboutPage(req, res) {
  try {
    logger.info("Rendering About page...");
    res.render("pages/about", {
      meta: {
        title: "About - Daily Journal",
        description: "Learn more about Daily Journal and its mission.",
      },
      styles: ["about"],
      ...constants.aboutData,
    });
    logger.info("Successfully rendered the about page");
  } catch (error) {
    logger.error("Error rendering about page:", error);
    errorHandler.renderError(
      res,
      500,
      "Something went wrong. Please try again later.",
      error
    );
  }
}

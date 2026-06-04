import logger from "../utils/logger.js";
import constants from "../utils/constants.js";
import { errorHandler } from "../utils/errorHandler.js";

/**
 * GET /about
 * Renders the About page with dynamic content from constants.
 *
 * @async
 * @function renderAboutPage
 */
export async function renderAboutPage(req, res) {
  try {
    res.render("pages/about", {
      meta: {
        title: "About - Daily Journal",
        description: "Learn more about Daily Journal and its mission.",
      },
      styles: ["about"],
      ...constants.aboutData,
    });
    logger.info("Rendered about page");
  } catch (error) {
    logger.error(`Error rendering about page: ${error.message}`);
    errorHandler.renderError(
      res,
      500,
      "Something went wrong. Please try again later.",
      error,
    );
  }
}

import logger from "../utils/logger.js";
import constants from "../utils/constants.js";
import { errorHandler } from "../utils/errorHandler.js";

/**
 * GET /
 * Renders the homepage.
 */
export async function renderHomePage(req, res) {
  try {
    res.render("pages/home", {
      meta: {
        title: "Daily Journal - Home",
        description:
          "Welcome to Daily Journal - Share your thoughts and experiences",
      },
      styles: ["home"],
      scripts: ["flash"],
      startingTitle: constants.startingTitle,
      startingContentHome: constants.startingContentHome,
      writeReadContentHome: constants.writeReadContentHome,
    });
    logger.info("Rendered home page");
  } catch (error) {
    logger.error(`Error rendering home page: ${error.message}`);
    errorHandler.renderError(res, 500, "Failed to load homepage.", error);
  }
}

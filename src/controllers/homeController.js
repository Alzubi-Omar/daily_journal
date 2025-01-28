import { fetchAllPosts } from "../services/postService.js";
import logger from "../utils/logger.js";
import constants from "../utils/constants.js";
import { errorHandler } from "../utils/errorHandler.js";

/**
 * @fileoverview Renders the homepage with fetched posts and dynamic content.
 * @description Handles errors by rendering an error page.
 *
 * @async
 * @function renderHomePage
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
export async function renderHomePage(req, res) {
  try {
    await fetchAllPosts();
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
    logger.info("Successfully rendered the home page");
  } catch (error) {
    logger.error("Error rendering home page:", error);
    errorHandler.renderError(res, 500, "Failed to load homepage", error);
  }
}

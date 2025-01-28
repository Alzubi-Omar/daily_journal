import { fetchAllPosts } from "../services/postService.js";
import logger from "../utils/logger.js";
import { errorHandler } from "../utils/errorHandler.js";

/**
 * Fetches all posts from the database.
 * Adds a calculated read time based on the word count of each post.
 *
 * @async
 * @function fetchAllPosts
 * @returns {Promise<Array>} A list of posts with added read time information.
 */

export async function renderBlogPage(req, res) {
  try {
    const posts = await fetchAllPosts();
    logger.info("Successfully retrieved all posts");
    res.render("pages/read", {
      meta: {
        title: "Latest Stories - Daily Journal",
        description: "Browse our collection of thoughtful articles",
      },
      styles: ["read"],
      scripts: ["flash"],
      posts,
    });
    logger.info("Successfully rendered the blog page");
  } catch (error) {
    logger.error("Error rendering blog page:", error);
    errorHandler.renderError(res, 500, "Failed to load blog page.", error);
  }
}

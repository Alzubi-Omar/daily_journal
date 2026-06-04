import { fetchAllPosts } from "../services/postService.js";
import logger from "../utils/logger.js";
import { errorHandler } from "../utils/errorHandler.js";

/**
 * GET /blogs
 * Fetches all posts and renders the blog listing page.
 * Each post includes a calculated read time based on word count.
 *
 * @async
 * @function renderBlogPage
 */
export async function renderBlogPage(req, res) {
  try {
    const posts = await fetchAllPosts();
    logger.info(`Blog page rendered — ${posts.length} posts loaded`);
    res.render("pages/read", {
      meta: {
        title: "Latest Stories - Daily Journal",
        description: "Browse our collection of thoughtful articles",
      },
      styles: ["read"],
      scripts: ["flash"],
      posts,
    });
  } catch (error) {
    logger.error(`Error rendering blog page: ${error.message}`);
    errorHandler.renderError(res, 500, "Failed to load blog page.", error);
  }
}

import pool from "../config/connection.js";
import logger from "../utils/logger.js";

/**
 * Fetches all posts from the database.
 * Adds a calculated read time based on the word count of each post.
 *
 * @async
 * @function fetchAllPosts
 * @returns {Promise<Array>} A list of posts with added read time information.
 */
export async function fetchAllPosts() {
  try {
    const result = await pool.query(
      "SELECT * FROM posts ORDER BY created_at DESC"
    );
    return result.rows.map((post) => ({
      ...post,
      readTime: Math.ceil((post.content || "").split(/\s+/).length / 200),
    }));
  } catch (err) {
    logger.error("Error fetching posts:", err);
    throw new Error("Unable to fetch posts");
  }
}

/**
 * Fetches a single post by ID from the database.
 *
 * @async
 * @function fetchPostById
 * @param {string} postId - The ID of the post to fetch.
 * @returns {Object|null} - The post object if found, otherwise null.
 */
export async function fetchPostById(postId) {
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    return result.rows[0] || null;
  } catch (err) {
    logger.error(`Error fetching post with ID ${postId}:`, err);
    throw new Error("Unable to fetch the post");
  }
}

/**
 * Deletes a post by its ID from the database.
 *
 * @async
 * @function deletePostById
 * @param {string} postId - The ID of the post to delete.
 * @returns {boolean} - True if the post was successfully deleted, otherwise false.
 */
export async function deletePostById(postId) {
  try {
    const result = await pool.query("DELETE FROM posts WHERE id = $1", [
      postId,
    ]);

    // Check if the post was successfully deleted
    if (result.rowCount === 1) {
      return true;
    }

    // Log if no post was deleted (e.g., invalid ID)
    logger.warn(`No post found to delete with ID: ${postId}`);
    return false;
  } catch (err) {
    // Log the error for debugging purposes
    logger.error(`Error deleting post with ID ${postId}:`, err);
    throw new Error("Unable to delete the post");
  }
}

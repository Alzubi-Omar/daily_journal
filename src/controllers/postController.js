import bcrypt from "bcrypt";
import pool from "../config/connection.js";
import logger from "../utils/logger.js";
import { fetchPostById, deletePostById } from "../services/postService.js";
import { verifyPassword } from "../utils/password.js";
import { errorHandler } from "../utils/errorHandler.js";
import { validators } from "../utils/validators.js";

const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;

/**
 * Validates a post's existence and accessibility.
 * Returns the post or renders an error and returns null.
 *
 * @param {string|number} postId
 * @param {Object} res
 * @returns {Promise<Object|null>}
 */
async function validatePost(postId, res) {
  if (!validators.isValidPostId(postId)) {
    logger.warn(`Invalid post ID: ${postId}`);
    errorHandler.renderError(res, 400, "Invalid post ID.");
    return null;
  }

  const post = await fetchPostById(postId);
  if (!post) {
    logger.warn(`Post not found: ${postId}`);
    errorHandler.renderError(res, 404, "Post not found.");
    return null;
  }

  return post;
}

/**
 * Verifies a submitted password against the stored bcrypt hash.
 * Renders the auth page with an error message on failure.
 * Returns true on success, null on failure.
 *
 * @param {string} password
 * @param {string} storedPasskey
 * @param {string|number} postId
 * @param {Object} res
 * @param {string} route - "edit" | "delete"
 * @returns {Promise<true|null>}
 */
async function validatePassword(password, storedPasskey, postId, res, route) {
  if (!password) {
    logger.warn(`Password not provided for post: ${postId}`);
    res.status(400).render("pages/auth", {
      meta: { title: `${route} Post - Daily Journal` },
      styles: ["auth"],
      route,
      postId,
      message: "Password is required.",
    });
    return null;
  }

  const isPasswordValid = await verifyPassword(password, storedPasskey);

  if (!isPasswordValid) {
    logger.warn(`Incorrect password attempt for post: ${postId}`);
    res.status(401).render("pages/auth", {
      meta: { title: `${route} Post - Daily Journal` },
      styles: ["auth"],
      route,
      postId,
      message: "Invalid password. Please try again.",
    });
    return null;
  }

  return true;
}

/**
 * GET /posts/new
 * Renders the compose form.
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
    logger.info("Rendered compose page");
  } catch (error) {
    logger.error(`Error rendering compose page: ${error.message}`);
    errorHandler.renderError(
      res,
      500,
      "An error occurred. Please try again later.",
      error,
    );
  }
}

/**
 * POST /posts
 * Sanitizes input, hashes the password, inserts the post.
 */
export async function createPost(req, res) {
  const { postName, password, postTitle, postContent } = req.body;

  const sanitizedName = validators.sanitizeInput(postName);
  const sanitizedTitle = validators.sanitizeInput(postTitle);
  const sanitizedContent = validators.sanitizeInput(postContent);

  // Validate required fields before hashing
  const validation = validators.validatePostFields(
    sanitizedTitle,
    sanitizedContent,
  );
  if (!validation.isValid) {
    return errorHandler.renderError(res, 400, validation.errors[0]);
  }

  try {
    const hash = await bcrypt.hash(password, saltRounds);

    await pool.query(
      "INSERT INTO posts(name, passkey, title, content) VALUES($1, $2, $3, $4)",
      [sanitizedName, hash, sanitizedTitle, sanitizedContent],
    );

    logger.info(`New post created: "${sanitizedTitle}" by ${sanitizedName}`);
    req.flash("success", "Post published successfully!");
    res.redirect("/blogs");
  } catch (error) {
    logger.error(`Error creating post: ${error.message}`);
    errorHandler.renderError(
      res,
      500,
      "Failed to publish post. Please try again.",
      error,
    );
  }
}

/**
 * GET /posts/:id
 * Fetches and renders a single post.
 * Content is stored plain and rendered escaped — XSS prevention via CSS.
 */
export async function readPostById(req, res) {
  const { id: postId } = req.params;

  try {
    const post = await validatePost(postId, res);
    if (!post) return;

    logger.info(`Post retrieved: ${postId}`);

    res.render("pages/post", {
      meta: {
        title: `${post.title} - Daily Journal`,
        description: post.content ? post.content.substring(0, 150) + "..." : "",
      },
      styles: ["post"],
      scripts: ["flash"],
      post,
      messages: req.flash(),
    });
  } catch (error) {
    logger.error(`Error retrieving post ${postId}: ${error.message}`);
    errorHandler.renderError(
      res,
      500,
      "Error retrieving post. Please try again.",
      error,
    );
  }
}

/**
 * GET /posts/:id/edit
 * Renders the password auth page before allowing edits.
 */
export async function editPostPage(req, res) {
  const { id: postId } = req.params;

  try {
    const post = await validatePost(postId, res);
    if (!post) return;

    res.render("pages/auth", {
      meta: { title: "Edit Post - Daily Journal" },
      styles: ["auth"],
      route: "edit",
      postId,
      message: "Enter your password to edit this post.",
      post,
    });
  } catch (error) {
    logger.error(
      `Error rendering edit page for post ${postId}: ${error.message}`,
    );
    errorHandler.renderError(
      res,
      500,
      "Error loading edit page. Please try again.",
      error,
    );
  }
}

/**
 * POST /posts/:id/edit
 * Verifies password then renders the edit form.
 */
export async function authenticatePostEdit(req, res) {
  const { id: postId } = req.params;
  const { password } = req.body;

  const sanitizedPassword = validators.sanitizeInput(password);

  try {
    const post = await validatePost(postId, res);
    if (!post) return;

    const isValid = await validatePassword(
      sanitizedPassword,
      post.passkey,
      postId,
      res,
      "edit",
    );
    if (!isValid) return;

    logger.info(`Edit authenticated for post: ${postId}`);

    res.render("pages/edit", {
      meta: { title: `Edit "${post.title}" - Daily Journal` },
      styles: ["edit"],
      post,
    });
  } catch (error) {
    logger.error(`Error during edit auth for post ${postId}: ${error.message}`);
    errorHandler.renderError(
      res,
      500,
      "An unexpected error occurred. Please try again.",
      error,
    );
  }
}

/**
 * POST /posts/:id/update
 * Validates and saves updated title + content.
 */
export async function updatePostById(req, res) {
  const { id: postId } = req.params;
  const { NewPostTitle: title, NewPostContent: content } = req.body;

  const sanitizedTitle = validators.sanitizeInput(title);
  const sanitizedContent = validators.sanitizeInput(content);

  try {
    const post = await validatePost(postId, res);
    if (!post) return;

    const validation = validators.validatePostFields(
      sanitizedTitle,
      sanitizedContent,
    );
    if (!validation.isValid) {
      return errorHandler.renderError(res, 400, validation.errors[0]);
    }

    const result = await pool.query(
      "UPDATE posts SET title = $1, content = $2 WHERE id = $3",
      [sanitizedTitle, sanitizedContent, postId],
    );

    if (result.rowCount === 1) {
      logger.info(`Post updated: ${postId}`);
      req.flash("success", "Post updated successfully!");
      return res.redirect(`/posts/${postId}`);
    }

    logger.error(`Post update failed — unexpected rowCount for ID: ${postId}`);
    errorHandler.renderError(
      res,
      500,
      "An unexpected error occurred. Please try again.",
    );
  } catch (error) {
    logger.error(`Error updating post ${postId}: ${error.message}`);
    errorHandler.renderError(
      res,
      500,
      "An unexpected error occurred. Please try again.",
      error,
    );
  }
}

/**
 * GET /posts/:id/delete
 * Renders the password auth page before allowing deletion.
 */
export async function confirmDeletePost(req, res) {
  const { id: postId } = req.params;

  try {
    const post = await validatePost(postId, res);
    if (!post) return;

    res.render("pages/auth", {
      meta: { title: "Delete Post - Daily Journal" },
      styles: ["auth"],
      route: "delete",
      postId,
      message: "Enter your password to delete this post.",
    });
  } catch (error) {
    logger.error(
      `Error loading delete page for post ${postId}: ${error.message}`,
    );
    errorHandler.renderError(
      res,
      500,
      "An unexpected error occurred. Please try again.",
      error,
    );
  }
}

/**
 * POST /posts/:id/delete
 * Verifies password then deletes the post.
 */
export async function deletePost(req, res) {
  const { id: postId } = req.params;
  const { password } = req.body;

  const sanitizedPassword = validators.sanitizeInput(password);

  try {
    const post = await validatePost(postId, res);
    if (!post) return;

    const isValid = await validatePassword(
      sanitizedPassword,
      post.passkey,
      postId,
      res,
      "delete",
    );
    if (!isValid) return;

    const isDeleted = await deletePostById(postId);

    if (isDeleted) {
      logger.info(`Post deleted: ${postId}`);
      req.flash("success", "Post deleted successfully.");
      return res.redirect("/blogs");
    }

    logger.error(`Delete failed — unexpected rowCount for post: ${postId}`);
    errorHandler.renderError(
      res,
      500,
      "An unexpected error occurred. Please try again.",
    );
  } catch (error) {
    logger.error(`Error deleting post ${postId}: ${error.message}`);
    errorHandler.renderError(
      res,
      500,
      "An unexpected error occurred. Please try again.",
      error,
    );
  }
}

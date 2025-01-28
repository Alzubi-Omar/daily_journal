import bcrypt from "bcrypt";
import pool from "../config/connection.js";
import logger from "../utils/logger.js";
import { fetchPostById, deletePostById } from "../services/postService.js";
import { verifyPassword } from "../utils/password.js";
import { errorHandler } from "../utils/errorHandler.js";
import { validators } from "../utils/validators.js";

const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;

/**
 * Formats content by splitting it into paragraphs and handling line breaks
 *
 * @param {string} content
 * @returns {string[]} - An array of formatted paragraphs.
 */
function formatContent(content) {
  if (!content) return [];

  return content
    .split(/\n{2,}|\r\n{2,}/)
    .filter((p) => p.trim())
    .map((p) => p.trim().replace(/\n/g, "<br />"));
}

/**
 * Validates a post's existence and accessibility
 *
 * @param {string|number} postId
 * @returns {Promise<Object|null>}
 */
async function validatePost(postId, res) {
  if (!validators.isValidPostId(postId)) {
    logger.warn(`Invalid post ID: ${postId}`);
    return errorHandler.renderError(res, 400, "Invalid post ID.");
  }

  const post = await fetchPostById(postId);
  if (!post) {
    logger.warn(`Post not found: ${postId}`);
    return errorHandler.renderError(res, 404, "Post not found.");
  }

  return post;
}

/**
 * Validates the provided password vs the stored password hash
 *
 * @param {string|number}
 * @returns {Promise<boolean|void>} A promise that resolves to `true` if the password is valid,
 *                                    or renders an error page if the password is invalid or missing.
 */
async function validatePassword(password, storedPasskey, postId, res, route) {
  if (!password) {
    logger.warn(`Password not provided for post: ${postId}`);
    return res.status(400).render("pages/auth", {
      meta: { title: `${route} Post - Daily Journal` },
      styles: ["auth"],
      route,
      postId,
      message: "Password is required.",
    });
  }

  const isPasswordValid = await verifyPassword(password, storedPasskey);
  logger.info(`Password validation result: ${isPasswordValid}`);

  if (!isPasswordValid) {
    logger.warn(`Incorrect password for post: ${postId}`);
    return res.status(401).render("pages/auth", {
      meta: { title: `${route} Post - Daily Journal` },
      styles: ["auth"],
      route,
      postId,
      message: "Invalid password. Please try again.",
    });
  }

  return true;
}

/**
 * Handles the creation of a new post.
 * Captures form input, sanitize it, hashes the password, and inserts the post into the database.
 * @async
 * @function createPost
 */
export async function createPost(req, res) {
  const { postName, password, postTitle, postContent } = req.body;

  // Sanitize inputs
  const sanitizedName = validators.sanitizeInput(postName);
  const sanitizedTitle = validators.sanitizeInput(postTitle);
  const sanitizedContent = validators.sanitizeInput(postContent);

  try {
    // Hash the password and format the content
    const hash = await bcrypt.hash(password, saltRounds);
    const formattedContent = sanitizedContent.replace(/\n/g, "\n\n");

    // Insert the new post into the database
    await pool.query(
      "INSERT INTO posts(name, passkey, title, content) VALUES($1, $2, $3, $4)",
      [sanitizedName, hash, sanitizedTitle, formattedContent]
    );

    logger.info("New post created successfully:", {
      sanitizedName,
      sanitizedTitle,
    });

    // Set a flash message and redirect
    req.flash("success", "Post added successfully!");
    res.redirect("/blogs");
  } catch (error) {
    logger.error(`Error adding post: ${error.message}`, { error });
    // Render the error
    errorHandler.renderError(
      res,
      500,
      "Failed to add new post. Please try again later.",
      error
    );
  }
}

/**
 * Handles fetching and displaying a single post by ID.
 *
 * @async
 * @function readPostById
 */
export async function readPostById(req, res) {
  const { id: postId } = req.params;

  try {
    // Validate postId and Fetch the post from the database
    const post = await validatePost(postId, res);
    if (!post) return;

    // Format the post content and log successful post retrieval
    const formattedContent = formatContent(post.content);
    logger.info(`Post retrieved successfully with ID: ${postId}`);

    // Render the post
    res.render("pages/post", {
      meta: {
        title: `${post.title} - Daily Journal`,
        description: post.content ? post.content.substring(0, 150) + "..." : "",
      },
      styles: ["post"],
      scripts: ["flash"],
      post: { ...post, formattedContent },
      messages: req.flash(),
    });
  } catch (error) {
    logger.error(`Error retrieving post with ID: ${postId}`, { error });
    errorHandler.renderError(
      res,
      500,
      "An error occurred while retrieving the post. Please try again later.",
      error
    );
  }
}

/**
 * Handles rendering the edit page for a specific post by ID.
 *
 * @async
 * @function editPostPage
 */
export async function editPostPage(req, res) {
  const { id: postId } = req.params;

  try {
    // Validate postId and Fetch the post from the database
    const post = await validatePost(postId, res);
    if (!post) return;

    logger.info(`Rendering edit page for post: ${postId}`);

    // Render the edit page with the post data
    res.render("pages/auth", {
      meta: {
        title: "Edit Post",
        description: `Edit the post titled "${post.title}". Update the content, title, or associated details.`,
      },
      styles: ["auth"],
      route: "edit",
      postId,
      message: "Please enter your password to edit the post.",
      post,
    });
  } catch (error) {
    // Log the error
    logger.error(`Error rendering edit page: ${error.message}`, { error });
    errorHandler.renderError(
      res,
      500,
      "An error occurred while retrieving the post. Please try again later.",
      error
    );
  }
}

/**
 * Handles the authentication process for editing a post by verifying the password.
 *
 * @async
 * @function authenticatePostEdit
 */
export async function authenticatePostEdit(req, res) {
  const { id: postId } = req.params;
  const { password } = req.body;

  // Sanitize password input
  const sanitizedPassword = validators.sanitizeInput(password);

  try {
    // Validate postId and Fetch post details from the database
    const post = await validatePost(postId, res);
    if (!post) return;

    // Verify the password
    const isValid = await validatePassword(
      sanitizedPassword,
      post.passkey,
      postId,
      res,
      "edit"
    );
    if (isValid !== true) return;

    // Log successful authentication
    logger.info(`Authentication successful for post: ${postId}`);

    // Render the edit page
    res.render("pages/edit", {
      meta: {
        title: `Edit ${post.title} - Daily Journal`,
        description: `Edit the post titled "${post.title}". Update the content, title, or associated details.`,
      },
      styles: ["edit"],
      post,
    });
  } catch (error) {
    // Log the error
    logger.error(`Error during authentication: ${error.message}`, { error });
    errorHandler.renderError(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
}

/**
 * Updates a post's title and content by ID.
 *
 * @async
 * @function updatePostById
 */
export async function updatePostById(req, res) {
  const { id: postId } = req.params;
  const { NewPostTitle: title, NewPostContent: content } = req.body;

  // Sanitize inputs
  const sanitizedTitle = validators.sanitizeInput(title);
  const sanitizedContent = validators.sanitizeInput(content);

  try {
    // Validate postId
    const post = await validatePost(postId, res);
    if (!post) return;

    // Validate title and content
    const validation = validators.validatePostFields(
      sanitizedTitle,
      sanitizedContent
    );

    if (!validation.isValid) {
      return errorHandler.renderError(res, 400, validation.errors[0]);
    }

    // Update the post in the database
    const result = await pool.query(
      "UPDATE posts SET title = $1, content = $2 WHERE id = $3",
      [sanitizedTitle, sanitizedContent, postId]
    );

    // if the post updated successfully
    if (result.rowCount === 1) {
      logger.info(`Post updated successfully: ${postId}`);

      // Set a flash message and redirect
      req.flash("success", "Post updated successfully!");
      return res.redirect(`/posts/${postId}`);
    }

    logger.error(`Unexpected error: Post update failed for ID: ${postId}`);
    errorHandler.renderError(
      res,
      500,
      "An unexpected error occurred. Please try again later."
    );
  } catch (error) {
    logger.error(`Error updating post: ${error.message}`, { error });
    errorHandler.renderError(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
}

/**
 * Renders the delete confirmation page for a specific post.
 *
 * @async
 * @function confirmDeletePost
 */
export async function confirmDeletePost(req, res) {
  const { id: postId } = req.params;

  try {
    // Validate postId and Fetch post details from the database
    const post = await validatePost(postId, res);
    if (!post) return;

    // Render the delete confirmation form
    res.render("pages/auth", {
      meta: {
        title: "Delete Post - Daily Journal",
        description: `Confirm deletion of the post titled "${post.title}".`,
      },
      route: "delete",
      postId,
      styles: ["auth"],
      message: "Password is required.",
    });
  } catch (error) {
    // Log the error
    logger.error(`Error retrieving post for deletion: ${error.message}`, {
      error,
    });
    errorHandler.renderError(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
}

/**
 * Handles the deletion of a specific post.
 *
 * @async
 * @function deletePost
 */
export async function deletePost(req, res) {
  const { id: postId } = req.params;
  const { password } = req.body;

  // Sanitize password input
  const sanitizedPassword = validators.sanitizeInput(password);

  try {
    // Validate postId and Fetch the post details
    const post = await validatePost(postId, res);
    if (!post) return;

    // Validate password and post.passkey
    const isValid = await validatePassword(
      sanitizedPassword,
      post.passkey,
      postId,
      res,
      "delete"
    );
    if (isValid !== true) return;

    // Delete the post
    const isDeleted = await deletePostById(postId);

    if (isDeleted) {
      logger.info(`Post deleted successfully: ${postId}`);
      req.flash("success", "Post deleted successfully!");
      res.redirect("/blogs");
    } else {
      logger.error(
        `Error deleting post: Unexpected rowCount for post: ${postId}`
      );
      errorHandler.renderError(
        res,
        500,
        "An unexpected error occurred. Please try again later."
      );
    }
  } catch (error) {
    // Log the error
    logger.error(`Error deleting post: ${error.message}`, { error });
    errorHandler.renderError(
      res,
      500,
      "An unexpected error occurred. Please try again later.",
      error
    );
  }
}

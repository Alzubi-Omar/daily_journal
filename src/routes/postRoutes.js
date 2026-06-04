import express from "express";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  renderComposePage,
  createPost,
  readPostById,
  editPostPage,
  authenticatePostEdit,
  updatePostById,
  confirmDeletePost,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

/**
 * GET /posts/new
 * Renders the compose form for creating a new post.
 */
router.get("/new", renderComposePage);

/**
 * POST /posts
 * Handles new post creation.
 */
router.post("/", createPost);

/**
 * GET /posts/:id
 * Displays a single post by ID.
 */
router.get("/:id", readPostById);

/**
 * GET /posts/:id/edit
 * Renders the password auth page for editing.
 */
router.get("/:id/edit", editPostPage);

/**
 * POST /posts/:id/edit
 * Authenticates and renders the edit form.
 */
router.post("/:id/edit", authLimiter, authenticatePostEdit);

/**
 * POST /posts/:id/update
 * Saves updated post content.
 */
router.post("/:id/update", updatePostById);

/**
 * GET /posts/:id/delete
 * Renders the password auth page for deletion.
 */
router.get("/:id/delete", confirmDeletePost);

/**
 * POST /posts/:id/delete
 * Authenticates and deletes the post.
 */
router.post("/:id/delete", authLimiter, deletePost);

export default router;

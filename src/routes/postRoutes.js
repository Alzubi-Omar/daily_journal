import express from "express";
import {
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
 * Handles new post creation
 * @route POST /new
 */
router.post("/new", createPost);

/**
 * Displays a single blog post by ID
 * @route GET /:id
 */
router.get("/:id", readPostById);

/**
 * Renders post editing interface
 * @route GET /:id/edit
 */
router.get("/:id/edit", editPostPage);

/**
 * Authenticates user for post editing
 * @route POST /:id/edit
 */
router.post("/:id/edit", authenticatePostEdit);

/**
 * Updates existing post content
 * @route POST /:id/update
 */
router.post("/:id/update", updatePostById);

/**
 * Displays post deletion confirmation
 * @route GET /:id/delete
 */
router.get("/:id/delete", confirmDeletePost);

/**
 * Handles post deletion
 * @route POST /:id/delete
 */
router.post("/:id/delete", deletePost);

export default router;

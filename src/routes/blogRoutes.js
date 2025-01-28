import express from "express";
import { renderBlogPage } from "../controllers/blogController.js";

const router = express.Router();

/**
 * Renders the Blog page with all posts
 * @route {GET} /
 */
router.get("/", renderBlogPage);

export default router;

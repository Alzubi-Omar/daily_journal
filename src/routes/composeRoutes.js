import express from "express";
import { renderComposePage } from "../controllers/composeController.js";

const router = express.Router();

/**
 * Renders the Compose page for creating new posts
 * @route {GET} /
 */
router.get("/", renderComposePage);

export default router;

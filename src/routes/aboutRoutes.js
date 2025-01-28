// aboutRoutes.js
import express from "express";
import { renderAboutPage } from "../controllers/aboutController.js";

const router = express.Router();

/**
 * Renders the About page
 * @route {GET} /
 */
router.get("/", renderAboutPage);

export default router;

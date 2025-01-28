import express from "express";
import { renderHomePage } from "../controllers/homeController.js";

const router = express.Router();

/**
 * Renders the Home page
 * @route {GET} /
 */
router.get("/", renderHomePage);

export default router;

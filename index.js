/**
 * @fileoverview Entry point for the Daily Journal Web Application.
 */

import express from "express";
import "dotenv/config";
import flash from "express-flash";
import { configureViewEngine } from "./src/config/viewEngine.js";
import { sessionMiddleware } from "./src/config/session.js";
import logger from "./src/utils/logger.js";
import initializeDatabase from "./src/config/db.js";
import securityHeaders from "./src/middleware/securityHeaders.js";
import blogRoutes from "./src/routes/blogRoutes.js";
import aboutRoutes from "./src/routes/aboutRoutes.js";
import homeRoutes from "./src/routes/homeRoutes.js";
import composeRoutes from "./src/routes/composeRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

configureViewEngine(app);

app.use(securityHeaders);

app.use(sessionMiddleware);
app.use(flash());

// Routes
app.use("/", homeRoutes);
app.use("/blogs", blogRoutes);
app.use("/about", aboutRoutes);
app.use("/new", composeRoutes);
app.use("/posts", postRoutes);

(async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () =>
      logger.info(`Server is running on http://localhost:${PORT}`)
    );
  } catch (err) {
    logger.error("Failed to start the server:", err);
    process.exit(1);
  }
})();

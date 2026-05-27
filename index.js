/**
 * @fileoverview Entry point for the Daily Journal Web Application.
 */

import express from "express";
import "dotenv/config";
import helmet from "helmet";
import flash from "express-flash";
import cookieParser from "cookie-parser";
import { configureViewEngine } from "./src/config/viewEngine.js";
import { sessionMiddleware } from "./src/config/session.js";
import logger from "./src/utils/logger.js";
import initializeDatabase, { pool } from "./src/config/db.js";
import {
  doubleCsrfProtection,
  csrfTokenMiddleware,
} from "./src/middleware/csrf.js";
import { globalLimiter } from "./src/middleware/rateLimiter.js";
import blogRoutes from "./src/routes/blogRoutes.js";
import aboutRoutes from "./src/routes/aboutRoutes.js";
import homeRoutes from "./src/routes/homeRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";

/* -- Startup validation -- */
const REQUIRED_ENV = ["DATABASE_URL", "SESSION_SECRET"];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[FATAL] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

if (
  process.env.NODE_ENV === "production" &&
  process.env.SESSION_SECRET.length < 32
) {
  console.error(
    "[FATAL] SESSION_SECRET must be at least 32 characters in production.",
  );
  process.exit(1);
}

const app = express();
app.use(cookieParser());
const PORT = process.env.PORT || 3000;

configureViewEngine(app);

/* -- Security -- */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        scriptSrc: ["'self'"],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

/* -- Rate Limiting, Session and Flash -- */
app.use(globalLimiter);
app.use(sessionMiddleware);
app.use(flash());

/* -- CSRF Protection -- */
app.use(doubleCsrfProtection);
app.use(csrfTokenMiddleware);

/* -- Routes -- */
app.use("/", homeRoutes);
app.use("/blogs", blogRoutes);
app.use("/about", aboutRoutes);
app.use("/posts", postRoutes);

/* -- 404 handler -- */
app.use((req, res) => {
  res.status(404).render("pages/error", {
    meta: { title: "404 - Page Not Found" },
    error: "The page you are looking for does not exist.",
    details: undefined,
  });
});

/* -- Global error handler -- */
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).render("pages/error", {
    meta: { title: "Error - Daily Journal" },
    error: "An unexpected error occurred. Please try again later.",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/* -- Graceful shutdown -- */
async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully...`);
  try {
    await pool.end();
    logger.info("Database connection pool closed.");
  } catch (err) {
    logger.error(`Error during shutdown: ${err.message}`);
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

/* -- Start server -- */
(async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () =>
      logger.info(`Server running on http://localhost:${PORT}`),
    );
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
})();

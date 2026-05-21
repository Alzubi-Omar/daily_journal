import session from "express-session";

/**
 * Session middleware configuration.
 *
 * Uses in-memory session store for simplicity.
 * Swap with persistent store (e.g., PostgreSQL or Redis) for scaling.
 */
export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
  name: "sessionId",
  rolling: true,
});

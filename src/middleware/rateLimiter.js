import rateLimit from "express-rate-limit";

/**
 * Global rate limiter — applied to all routes.
 * Prevents general abuse and scraping.
 *
 * 200 requests per 15 minutes per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later.",
  },
});

/**
 * Strict rate limiter — applied to auth POST routes only.
 * Prevents brute-force password guessing on edit/delete endpoints.
 *
 * 5 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Please try again in 15 minutes.",
  },
});

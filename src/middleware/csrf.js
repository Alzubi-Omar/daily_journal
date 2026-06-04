import { doubleCsrf } from "csrf-csrf";

const isProduction = process.env.NODE_ENV === "production";

/**
 * CSRF Protection
 *
 * Using Double Submit Cookie Pattern:
 * - Token is stored in a cookie
 * - Token must be sent back in every POST/PUT/DELETE request
 * - Protects against Cross-Site Request Forgery attacks
 */

export const CSRF_COOKIE_NAME = "x-csrf-token";

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET,

  // Cookie Configuration
  cookieName: CSRF_COOKIE_NAME,
  cookieOptions: {
    secure: isProduction, // HTTPS only in production
    sameSite: "lax",
    httpOnly: false,
    path: "/",
    maxAge: 1000 * 60 * 60, // 1 hour expiry
  },

  // Token settings
  size: 64,

  // Methods that don't need CSRF protection
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],

  // Where to look for the token
  getTokenFromRequest: (req) => {
    return req.body[CSRF_COOKIE_NAME] || req.headers["x-csrf-token"];
  },
});

/**
 * CSRF Token Middleware
 *
 * Always generates the token and makes it available in res.locals.csrfToken
 */
export function csrfTokenMiddleware(req, res, next) {
  res.locals.csrfToken = generateToken(req, res);
  next();
}

export { generateToken, doubleCsrfProtection };

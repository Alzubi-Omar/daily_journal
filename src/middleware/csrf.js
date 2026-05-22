import { doubleCsrf } from "csrf-csrf";

/**
 * CSRF protection middleware using the Double Submit Cookie pattern.
 *
 * How it works:
 * - A CSRF token is generated and stored in a signed cookie
 * - Every state-changing POST must include a matching token in the request body
 * - Requests with missing or mismatched tokens are rejected with 403
 *
 * The token is exposed via res.locals so every EJS view can access
 * it as `csrfToken` without any extra controller code.
 */
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET,
  cookieName: "x-csrf-token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
});

/**
 * Middleware that injects csrfToken into res.locals.
 * Makes the token available in all EJS views automatically.
 */
export function csrfTokenMiddleware(req, res, next) {
  res.locals.csrfToken = generateToken(req, res);
  next();
}

export { doubleCsrfProtection };

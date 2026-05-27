import { doubleCsrf } from "csrf-csrf";

const isProduction = process.env.NODE_ENV === "production";

/**
 * CSRF protection middleware using the Double Submit Cookie pattern.
 *
 * How it works:
 * - A CSRF token is generated and stored in a secure cookie
 * - The client must send the same token in each state-changing request (POST/PUT/DELETE)
 * - Requests with missing or invalid tokens are rejected with 403
 *
 * This prevents cross-site request forgery attacks by ensuring that
 * malicious websites cannot perform actions on behalf of a logged-in user.
 *
 * Cookie behavior:
 * - Uses "__Host-" prefix in production for stronger browser-level security rules
 * - Falls back to a simple cookie name in development (HTTP compatibility)
 *
 * The token is exposed via res.locals so EJS templates can access it as `csrfToken`
 * without needing extra controller logic.
 */
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET,
  cookieName: isProduction ? "__Host-psifi.x-csrf-token" : "x-csrf-token",
  cookieOptions: {
    secure: isProduction,
    sameSite: "lax",
    httpOnly: true,
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

export { generateToken, doubleCsrfProtection };

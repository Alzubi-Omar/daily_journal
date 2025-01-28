/**
 * Express middleware that sets security-focused HTTP headers
 * @middleware securityHeaders
 * @returns {void}
 * @description
 * Applies essential security headers to all responses:
 * - X-Content-Type-Options: Prevent MIME type sniffing
 * - X-Frame-Options: Prevent clickjacking attacks
 * - Strict-Transport-Security: Enforce HTTPS connections (with subdomains and optional preload)
 * - Content-Security-Policy: Control sources for content such as styles and fonts
 * - Referrer-Policy: Controls how much referrer information is sent with requests
 * - Permissions-Policy: Restrict access to certain browser features
 */
export default function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");

  res.setHeader("X-Frame-Options", "DENY");

  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
  );

  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  next();
}

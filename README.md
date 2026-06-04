# Daily Journal

A full-stack blog application where users can write, edit, and delete password-protected posts. Built with Node.js, Express, PostgreSQL, and EJS.

**Live demo:** [live-soon]
**Portfolio:** [omar-alzubi-portfolio.netlify.app](https://omar-alzubi-portfolio.netlify.app) &nbsp;·&nbsp;
**Author:** [Omar Alzubi](https://linkedin.com/in/omaralzubi-007oa)

---

## Features

- Create posts with a title, author name, and bcrypt-hashed password
- Browse all posts with calculated read time
- Edit or delete posts after password authentication
- Flash messages confirm every action
- Fully responsive — mobile to desktop

---

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Runtime    | Node.js 20+                                 |
| Framework  | Express.js                                  |
| Database   | PostgreSQL via `pg` connection pool         |
| Templating | EJS with `express-ejs-layouts`              |
| Auth       | Per-post bcrypt password hashing            |
| Security   | `helmet`, `csrf-csrf`, `express-rate-limit` |
| Session    | `express-session` with MemoryStore          |

---

## Architecture

```
src/
├── config/          # DB connection, session, view engine, paths
├── controllers/     # Route handlers — one file per resource
├── middleware/       # CSRF protection, rate limiting
├── routes/          # Express routers — URL mapping only
├── services/        # Database queries (postService.js)
├── utils/           # Logger, validators, error handler, password utils
└── views/
    ├── layouts/     # Base HTML shell (main.ejs)
    ├── pages/       # Page templates
    └── partials/    # Header and footer
```

---

## Local Setup

### Prerequisites

- Node.js 20+
- PostgreSQL (local or hosted)

### Install

```bash
git clone https://github.com/Alzubi-Omar/daily_journal.git
cd daily_journal
npm install
```

### Configure environment

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/daily_journal
SESSION_SECRET=minimum-32-character-random-string
SALT_ROUNDS=10
```

Generate a secure `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Run

```bash
# Development — auto-reload
npm run dev

# Production
npm start
```

The app creates the `posts` table automatically on first run.

---

## Routes

| Method | Path                | Description              |
| ------ | ------------------- | ------------------------ |
| GET    | `/`                 | Homepage                 |
| GET    | `/blogs`            | All posts                |
| GET    | `/posts/new`        | Compose form             |
| POST   | `/posts`            | Create post              |
| GET    | `/posts/:id`        | Single post              |
| GET    | `/posts/:id/edit`   | Password auth for edit   |
| POST   | `/posts/:id/edit`   | Authenticate edit        |
| POST   | `/posts/:id/update` | Save updated post        |
| GET    | `/posts/:id/delete` | Password auth for delete |
| POST   | `/posts/:id/delete` | Delete post              |

---

## Security

This app was refactored through a structured security audit. Every decision is documented in the commit history on the `refactor/v2-security-improvements` branch.

| Concern          | Implementation                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| SQL injection    | All queries use parameterized `$1, $2` placeholders — no string interpolation near the DB                          |
| XSS              | User content rendered with `<%= %>` (escaped). `white-space: pre-wrap` handles line breaks — no raw HTML injection |
| CSRF             | Double Submit Cookie pattern via `csrf-csrf` on every state-changing POST                                          |
| Brute force      | `express-rate-limit` — 5 auth attempts per 15 min per IP                                                           |
| Security headers | `helmet` — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy                                         |
| Session          | `httpOnly`, `sameSite: lax`, `secure` in production, named cookie                                                  |
| Body size        | 10kb limit on urlencoded input prevents bcrypt CPU exhaustion                                                      |
| Secrets          | App exits at startup if `SESSION_SECRET` or `DATABASE_URL` is missing                                              |

### Known dependency note

Two vulnerabilities exist in `tar` and `@mapbox/node-pre-gyp` — both are transitive dependencies of `bcrypt`'s native build toolchain, only invoked during `npm install`. They are not reachable at runtime and do not affect application security. No fix is available without replacing `bcrypt`.

---

## Refactor history

This repo reflects an active progression from v1 to v2. The commit history on `refactor/v2-security-improvements` shows the full journey — each commit addresses one specific concern identified in a structured audit. The initial working app remains as the first commit for full context.

---

## License

ISC

import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";

/**
 * @fileoverview Express session middleware configuration for secure session management.
 * @exports sessionMiddleware
 * @type {import('express-session').SessionOptions}
 * @description
 * Configures session management for an Express application:
 * - In production, sessions are managed via Redis.
 * - In development, MemoryStore is used as a fallback store.
 *
 * The Redis client is connected and disconnected gracefully, with error handling.
 * The session store is configured to use Redis in production.
 *
 * Middleware also handles secure cookie settings (only in production) and session management settings.
 *
 */

// Initialize Redis client and store
let sessionStore;

if (process.env.NODE_ENV === "production") {
  const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
    },
  });

  redisClient
    .connect()
    .then(() => {
      console.log("Connected to Redis");
    })
    .catch((err) => {
      console.error("Error connecting to Redis:", err.message);
      process.exit(1);
    });

  // Error Listener
  redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err.message);
  });

  // Connect Listener
  redisClient.on("connect", () => {
    console.log("Redis connection established successfully.");
  });

  // Create Redis session store
  sessionStore = new RedisStore({
    client: redisClient,
    prefix: "session:",
  });

  // Graceful Redis shutdown
  process.on("SIGINT", async () => {
    console.log("Shutting down Redis client...");
    await redisClient.quit();
    console.log("Redis client closed.");
    process.exit(0);
  });
}

export const sessionMiddleware = session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
  name: "sessionId",
  rolling: true,
});

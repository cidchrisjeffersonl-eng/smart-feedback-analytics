import rateLimit from "express-rate-limit";

// Strict limiter for auth endpoints — guards against brute-force login attempts.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  message: { message: "Too many attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Looser limiter for feedback submission — guards against spam without blocking normal use.
export const feedbackLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 submissions per IP per window
  message: {
    message:
      "Too many feedback submissions. Please slow down and try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General-purpose limiter for the rest of the API.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

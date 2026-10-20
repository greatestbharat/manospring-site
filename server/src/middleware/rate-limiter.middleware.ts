import rateLimit from 'express-rate-limit';

export const globalApiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 80,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests. Please wait a moment and try again.' }
});

export const chatLimiter = rateLimit({
  windowMs: 60_000,
  limit: 25,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many messages in a short time. Please take a breath and try again in a minute.' }
});

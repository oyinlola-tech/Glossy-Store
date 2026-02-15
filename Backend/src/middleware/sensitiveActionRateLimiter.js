const rateLimit = require('express-rate-limit');

const sensitiveActionRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many sensitive actions. Please try again later.' },
});

module.exports = sensitiveActionRateLimiter;

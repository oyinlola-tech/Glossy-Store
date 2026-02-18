const rateLimit = require('express-rate-limit');

const contactRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many contact submissions. Please try again later.' },
});

module.exports = contactRateLimiter;

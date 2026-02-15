const rateLimit = require('express-rate-limit');

const paymentRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment requests. Please try again later.' },
});

module.exports = paymentRateLimiter;

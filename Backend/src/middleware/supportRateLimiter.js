const rateLimit = require('express-rate-limit');

const supportRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many support chat requests. Please slow down.',
});

module.exports = supportRateLimiter;

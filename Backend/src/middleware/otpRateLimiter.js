const rateLimit = require('express-rate-limit');

const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP attempts. Please wait and try again.' },
});

module.exports = otpRateLimiter;

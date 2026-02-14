const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 80, // limit each IP to 80 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health' || req.path === '/api/info' || req.path === '/health' || req.path === '/info',
  message: { error: 'Too many requests from this IP, please try again later.' },
});

module.exports = limiter;

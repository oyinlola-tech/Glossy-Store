const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const JWT_ALGORITHMS = (process.env.JWT_ALGORITHMS || 'HS256')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const extractBearerToken = (req) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
};

const isAdminSupportRequest = (req) => {
  const path = req.path || '';
  if (!(path.startsWith('/api/support') || path.startsWith('/support'))) return false;
  const token = extractBearerToken(req);
  if (!token || !process.env.JWT_SECRET) return false;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: JWT_ALGORITHMS });
    return decoded?.role === 'admin';
  } catch {
    return false;
  }
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 80, // limit each IP to 80 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => (
    req.method === 'OPTIONS'
    || req.path === '/api/health'
    || req.path === '/api/info'
    || req.path === '/health'
    || req.path === '/info'
    || isAdminSupportRequest(req)
  ),
  message: { error: 'Too many requests from this IP, please try again later.' },
});

module.exports = limiter;

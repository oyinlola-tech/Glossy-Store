const SENSITIVE_KEYS = new Set([
  'password',
  'newPassword',
  'currentPassword',
  'password_hash',
  'otp',
  'otp_code',
  'token',
]);

const sanitizeString = (value, shouldTrim = true) => {
  const noNullBytes = String(value).replace(/\u0000/g, '');
  return shouldTrim ? noNullBytes.trim() : noNullBytes;
};

const sanitizeValue = (value, key = '') => {
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item, key));
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, item]) => {
      acc[key] = sanitizeValue(item, key);
      return acc;
    }, {});
  }
  if (typeof value === 'string') {
    const shouldTrim = !SENSITIVE_KEYS.has(key);
    return sanitizeString(value, shouldTrim);
  }
  return value;
};

const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    Object.assign(req.query, sanitizeValue(req.query));
  }
  if (req.params && typeof req.params === 'object') {
    Object.assign(req.params, sanitizeValue(req.params));
  }
  next();
};

module.exports = sanitizeInput;

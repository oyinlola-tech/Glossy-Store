const errorHandler = (err, req, res, next) => {
  const requestId = req?.requestId;
  const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;

  if (process.env.NODE_ENV === 'production') {
    console.error(`[${requestId || 'n/a'}]`, err.message);
  } else {
    console.error(`[${requestId || 'n/a'}]`, err.stack || err.message);
  }

  if (err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed', requestId });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message, requestId });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message, requestId });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token', requestId });
  }

  if (statusCode >= 400 && statusCode < 500) {
    return res.status(statusCode).json({ error: err.message || 'Request failed', requestId });
  }

  res.status(500).json({ error: 'Something went wrong', requestId });
};

module.exports = errorHandler;

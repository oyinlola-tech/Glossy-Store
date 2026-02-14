const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    console.error(err.message);
  } else {
    console.error(err.stack);
  }

  if (err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.status(500).json({ error: 'Something went wrong' });
};

module.exports = errorHandler;

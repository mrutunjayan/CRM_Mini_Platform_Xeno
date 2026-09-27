export function notFound(req, res) {
  return res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large.' });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID.' });
  }
  if (Number.isInteger(error.status) && error.status >= 400 && error.status <= 599) {
    return res.status(error.status).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
}
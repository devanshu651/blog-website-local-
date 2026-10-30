function notFound(req, res) {
  if (req.originalUrl.startsWith('/api/')) return res.status(404).json({ error: { message: 'Resource not found' } });
  return res.status(404).render('errors/404', { title: 'Page not found' });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || (error.code === 'EBADCSRFTOKEN' ? 403 : error.code === 11000 ? 409 : 500);
  const message = status >= 500 ? 'Something went wrong. Please try again.' : error.message;
  if (status >= 500) console.error(error);
  if (req.originalUrl.startsWith('/api/')) return res.status(status).json({ error: { message } });
  return res.status(status).render('errors/500', { title: 'Something went wrong', message });
}

module.exports = { notFound, errorHandler };

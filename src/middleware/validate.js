const { validationResult } = require('express-validator');

module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  if (req.originalUrl.startsWith('/api/')) return res.status(422).json({ error: { message: 'Validation failed', details: errors.array().map(({ path, msg }) => ({ field: path, message: msg })) } });
  req.flashErrors = errors.array().map((entry) => entry.msg);
  return res.status(422).render(req.originalUrl.includes('login') ? 'auth/login' : req.originalUrl.includes('register') ? 'auth/register' : 'admin/editor', { title: 'Check your input', errors: req.flashErrors, values: req.body, post: req.body });
};

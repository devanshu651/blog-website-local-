const User = require('../models/User');

async function loadUser(req, res, next) {
  res.locals.currentUser = null;
  if (!req.session.userId) return next();
  try {
    const user = await User.findById(req.session.userId).select('_id name email role');
    if (!user) { req.session.destroy(() => {}); return next(); }
    req.user = user;
    res.locals.currentUser = user;
    return next();
  } catch (error) { return next(error); }
}

function requireAuth(req, res, next) {
  if (req.user) return next();
  if (req.originalUrl.startsWith('/api/')) return res.status(401).json({ error: { message: 'Authentication required' } });
  req.session.returnTo = req.originalUrl;
  return res.redirect('/login');
}

function requireAdmin(req, res, next) {
  if (!req.user) return requireAuth(req, res, next);
  if (req.user.role === 'admin') return next();
  if (req.originalUrl.startsWith('/api/')) return res.status(403).json({ error: { message: 'Administrator access required' } });
  return res.status(403).render('errors/403', { title: 'Access denied' });
}

module.exports = { loadUser, requireAuth, requireAdmin };

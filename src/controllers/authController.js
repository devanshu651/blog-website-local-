const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password, role: 'user' });
    req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.userId = user.id;
      return req.session.save((saveError) => {
        if (saveError) return next(saveError);
        if (req.originalUrl.startsWith('/api/')) return res.status(201).json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } });
        return res.redirect('/');
      });
    });
  } catch (error) { return next(error); }
}

async function login(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    const valid = user ? await user.checkPassword(req.body.password) : await bcrypt.compare(req.body.password, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
    if (!user || !valid) {
      if (req.originalUrl.startsWith('/api/')) return res.status(401).json({ error: { message: 'Invalid email or password' } });
      return res.status(401).render('auth/login', { title: 'Sign in', errors: ['Invalid email or password.'] });
    }
    req.session.regenerate((error) => {
      if (error) return next(error);
      req.session.userId = user.id;
      const apiRequest = req.originalUrl.startsWith('/api/');
      const returnTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      return req.session.save((saveError) => {
        if (saveError) return next(saveError);
        if (apiRequest) return res.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } });
        return res.redirect(returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/');
      });
    });
  } catch (error) { return next(error); }
}

function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('inkwell.sid', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    if (req.originalUrl.startsWith('/api/')) return res.status(204).end();
    return res.redirect('/');
  });
}

module.exports = { register, login, logout };

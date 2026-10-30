const session = require('express-session');
const MongoStore = require('connect-mongo');

function createSessionMiddleware() {
  const maxAge = Number(process.env.SESSION_MAX_AGE_DAYS || 7) * 24 * 60 * 60 * 1000;
  return session({
    name: 'inkwell.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI, collectionName: 'sessions', ttl: Math.ceil(maxAge / 1000) }),
    cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge }
  });
}

module.exports = createSessionMiddleware;

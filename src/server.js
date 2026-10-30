require('dotenv').config();
const connectDatabase = require('./config/db');

async function start() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Copy .env.example to .env and configure your MongoDB connection.');
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters');
  await connectDatabase(process.env.MONGODB_URI);
  const app = require('./app');
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, () => console.info(`Inkwell listening on port ${port}`));
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((error) => { console.error(error); process.exit(1); });

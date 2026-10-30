require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    throw new Error('Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 12 characters.');
  }
  await mongoose.connect(MONGODB_URI);
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) throw new Error('An account with that email already exists. No changes were made.');
  const user = await User.create({ name: ADMIN_NAME, email, password: ADMIN_PASSWORD, role: 'admin' });
  console.info(`Administrator created: ${user.email}`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());

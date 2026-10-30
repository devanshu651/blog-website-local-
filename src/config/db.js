const mongoose = require('mongoose');

async function connectDatabase(uri) {
  if (!uri) throw new Error('MONGODB_URI is required');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { autoIndex: process.env.NODE_ENV !== 'production' });
  // Provision unique and search indexes even when automatic background indexing is disabled.
  await Promise.all([
    require('../models/User').createIndexes(),
    require('../models/Post').createIndexes()
  ]);
  console.info('Connected to MongoDB');
}

module.exports = connectDatabase;

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 160 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 180 },
  excerpt: { type: String, required: true, trim: true, maxlength: 300 },
  content: { type: String, required: true, trim: true, minlength: 20, maxlength: 50000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  published: { type: Boolean, default: true },
  tags: [{ type: String, trim: true, lowercase: true, maxlength: 30 }]
}, { timestamps: true, strict: 'throw' });

postSchema.index({ published: 1, createdAt: -1 });
postSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
module.exports = mongoose.model('Post', postSchema);

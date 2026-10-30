const slugify = require('slugify');
const Post = require('../models/Post');

async function uniqueSlug(title, excludeId) {
  const base = slugify(title, { lower: true, strict: true, trim: true }).slice(0, 160) || 'post';
  let slug = base;
  let suffix = 2;
  while (await Post.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) slug = `${base}-${suffix++}`;
  return slug;
}

module.exports = uniqueSlug;

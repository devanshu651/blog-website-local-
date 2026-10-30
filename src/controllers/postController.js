const mongoose = require('mongoose');
const Post = require('../models/Post');
const uniqueSlug = require('../utils/slug');

async function list(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const filter = { published: true };
    if (req.query.q) filter.$text = { $search: req.query.q };
    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('author', 'name').lean(),
      Post.countDocuments(filter)
    ]);
    return res.json({ data: posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { return next(error); }
}

async function show(req, res, next) {
  try {
    const post = await Post.findOne({ slug: req.params.slug, published: true }).populate('author', 'name').lean();
    if (!post) return res.status(404).json({ error: { message: 'Post not found' } });
    return res.json({ data: post });
  } catch (error) { return next(error); }
}

async function create(req, res, next) {
  try {
    const post = await Post.create({ ...req.body, slug: await uniqueSlug(req.body.title), author: req.user.id });
    return res.status(201).json({ data: post });
  } catch (error) { return next(error); }
}

async function update(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: { message: 'Invalid post id' } });
    const changes = { ...req.body };
    if (changes.title) changes.slug = await uniqueSlug(changes.title, req.params.id);
    const post = await Post.findByIdAndUpdate(req.params.id, changes, { new: true, runValidators: true, context: 'query' });
    if (!post) return res.status(404).json({ error: { message: 'Post not found' } });
    return res.json({ data: post });
  } catch (error) { return next(error); }
}

async function remove(req, res, next) {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: { message: 'Post not found' } });
    return res.status(204).end();
  } catch (error) { return next(error); }
}

module.exports = { list, show, create, update, remove };

const express = require('express');
const { body } = require('express-validator');
const Post = require('../models/Post');
const { requireAdmin, requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const uniqueSlug = require('../utils/slug');
const { registerRules, loginRules } = require('../validators/auth');
const { createPostRules } = require('../validators/posts');
const auth = require('../controllers/authController');

const router = express.Router();
function preparePostForm(req, res, next) {
  req.body.tags = typeof req.body.tagsText === 'string' ? req.body.tagsText.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 10) : [];
  req.body.published = req.body.published === 'true';
  delete req.body.tagsText;
  next();
}
router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = 9;
  const [posts, total] = await Promise.all([
    Post.find({ published: true }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('author', 'name').lean(),
    Post.countDocuments({ published: true })
  ]);
  res.render('home', { title: 'Stories for the curious', description: 'Thoughtful notes on ideas, craft, and everyday discoveries.', posts, page, pages: Math.ceil(total / limit) });
}));
router.get('/posts/:slug', asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, published: true }).populate('author', 'name').lean();
  if (!post) return res.status(404).render('errors/404', { title: 'Post not found' });
  return res.render('posts/show', { title: post.title, description: post.excerpt, post });
}));
router.get('/register', (req, res) => res.render('auth/register', { title: 'Create an account', errors: [] }));
router.post('/register', registerRules, validate, auth.register);
router.get('/login', (req, res) => res.render('auth/login', { title: 'Sign in', errors: [] }));
router.post('/login', loginRules, validate, auth.login);
router.post('/logout', requireAuth, auth.logout);
router.get('/admin', requireAdmin, asyncHandler(async (req, res) => {
  const posts = await Post.find().sort({ updatedAt: -1 }).populate('author', 'name').lean();
  res.render('admin/index', { title: 'Manage stories', posts });
}));
router.get('/admin/posts/new', requireAdmin, (req, res) => res.render('admin/editor', { title: 'Write a story', post: {}, errors: [] }));
router.post('/admin/posts', requireAdmin, preparePostForm, createPostRules, validate, asyncHandler(async (req, res) => {
  const post = await Post.create({ ...req.body, slug: await uniqueSlug(req.body.title), author: req.user.id });
  res.redirect(`/posts/${post.slug}`);
}));
router.get('/admin/posts/:id/edit', requireAdmin, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).lean();
  if (!post) return res.status(404).render('errors/404', { title: 'Post not found' });
  return res.render('admin/editor', { title: 'Edit story', post, errors: [] });
}));
router.post('/admin/posts/:id', requireAdmin, preparePostForm, createPostRules, validate, asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, { ...req.body, slug: await uniqueSlug(req.body.title, req.params.id) }, { new: true, runValidators: true });
  if (!post) return res.status(404).render('errors/404', { title: 'Post not found' });
  return res.redirect(`/posts/${post.slug}`);
}));
router.post('/admin/posts/:id/delete', requireAdmin, asyncHandler(async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  return res.redirect('/admin');
}));
router.post('/admin/posts/:id/publish', requireAdmin, body('published').isBoolean().toBoolean(), validate, asyncHandler(async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, { published: req.body.published });
  return res.redirect('/admin');
}));
module.exports = router;

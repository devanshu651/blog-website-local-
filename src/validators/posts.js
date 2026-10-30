const { body, param, query } = require('express-validator');

const createPostRules = [
  body('title').trim().isLength({ min: 3, max: 160 }).withMessage('Title must be between 3 and 160 characters.'),
  body('excerpt').trim().isLength({ min: 1, max: 300 }).withMessage('Excerpt is required and must be at most 300 characters.'),
  body('content').trim().isLength({ min: 20, max: 50000 }).withMessage('Content must be between 20 and 50,000 characters.'),
  body('published').optional().isBoolean().toBoolean(),
  body('tags').optional().isArray({ max: 10 }).withMessage('Use up to 10 tags.'),
  body('tags.*').optional().trim().isLength({ min: 1, max: 30 })
];
const updatePostRules = [param('id').isMongoId(), ...createPostRules.map((rule) => rule.optional({ values: 'falsy' }))];
const listPostRules = [query('page').optional().isInt({ min: 1, max: 100000 }).toInt(), query('limit').optional().isInt({ min: 1, max: 50 }).toInt(), query('q').optional().trim().isLength({ max: 100 })];
module.exports = { createPostRules, updatePostRules, listPostRules };

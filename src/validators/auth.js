const { body } = require('express-validator');

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters.'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Enter a valid email address.'),
  body('password').isLength({ min: 12, max: 128 }).withMessage('Password must be between 12 and 128 characters.')
];
const loginRules = [body('email').trim().isEmail().normalizeEmail(), body('password').isLength({ min: 1, max: 128 })];

module.exports = { registerRules, loginRules };

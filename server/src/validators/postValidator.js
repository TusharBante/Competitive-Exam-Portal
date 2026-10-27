const { body } = require('express-validator');

const validateCreatePost = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
];

const validateComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1 })
    .withMessage('Comment must be at least 1 character'),
];

module.exports = { validateCreatePost, validateComment };

const { body } = require('express-validator');

const validateCreateReel = [
  body('caption')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Caption must be at most 500 characters'),
];

const validateComment = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1 })
    .withMessage('Comment must be at least 1 character'),
];

module.exports = { validateCreateReel, validateComment };

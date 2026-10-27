const { param, body } = require('express-validator');

const validateStartTest = [
  param('id').isMongoId().withMessage('Invalid test ID'),
];

const validateSubmitTest = [
  param('attemptId').isMongoId().withMessage('Invalid attempt ID'),
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('answers.*.questionId')
    .isMongoId()
    .withMessage('Each answer must have a valid question ID'),
  body('timeTaken')
    .optional()
    .isNumeric()
    .withMessage('Time taken must be a number'),
];

module.exports = { validateStartTest, validateSubmitTest };

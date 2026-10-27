const express = require('express');
const router = express.Router();
const {
  getTests,
  getTestById,
  startTest,
  submitTest,
  getAttemptResult,
  getTestHistory,
} = require('../controllers/mockTestController');
const { validateStartTest, validateSubmitTest } = require('../validators/testValidator');
const validate = require('../validators/validate');
const auth = require('../middleware/auth');

// All test routes are protected
router.use(auth);

// GET /api/tests/history - must be before /:id to avoid conflict
router.get('/history', getTestHistory);

// GET /api/tests
router.get('/', getTests);

// GET /api/tests/:id
router.get('/:id', getTestById);

// POST /api/tests/:id/start
router.post('/:id/start', validateStartTest, validate, startTest);

// POST /api/tests/attempts/:attemptId/submit
router.post('/attempts/:attemptId/submit', validateSubmitTest, validate, submitTest);

// GET /api/tests/attempts/:attemptId/result
router.get('/attempts/:attemptId/result', getAttemptResult);

module.exports = router;

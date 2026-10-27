const MockTest = require('../models/MockTest');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Get all active tests with optional filters, paginated
 * @route   GET /api/tests
 */
const getTests = catchAsync(async (req, res) => {
  const { category, difficulty, subject, page = 1, limit = 10 } = req.query;

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (subject) filter.subject = { $regex: subject, $options: 'i' };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await MockTest.countDocuments(filter);

  const tests = await MockTest.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-__v');

  res.status(200).json(
    ApiResponse.success('Tests fetched.', {
      tests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  );
});

/**
 * @desc    Get test details without questions (for preview)
 * @route   GET /api/tests/:id
 */
const getTestById = catchAsync(async (req, res) => {
  const test = await MockTest.findById(req.params.id).select('-__v');

  if (!test) {
    throw new ApiError(404, 'Test not found.');
  }

  res.status(200).json(ApiResponse.success('Test details fetched.', { test }));
});

/**
 * @desc    Start a test attempt
 * @route   POST /api/tests/:id/start
 */
const startTest = catchAsync(async (req, res) => {
  const testId = req.params.id;
  const userId = req.user._id;

  const test = await MockTest.findById(testId);
  if (!test) {
    throw new ApiError(404, 'Test not found.');
  }

  if (!test.isActive) {
    throw new ApiError(400, 'This test is no longer active.');
  }

  // Check for existing in-progress attempt
  const existingAttempt = await TestAttempt.findOne({
    userId,
    testId,
    status: 'in-progress',
  });

  if (existingAttempt) {
    throw new ApiError(400, 'You already have an in-progress attempt for this test.');
  }

  // Create new attempt
  const attempt = await TestAttempt.create({
    userId,
    testId,
    status: 'in-progress',
    startedAt: new Date(),
  });

  // Get questions but hide isCorrect from options
  const questions = await Question.find({ testId }).sort({ questionNumber: 1 });

  const sanitizedQuestions = questions.map((q) => ({
    _id: q._id,
    questionText: q.questionText,
    options: q.options.map((opt) => ({
      _id: opt._id,
      text: opt.text,
    })),
    marks: q.marks,
    questionNumber: q.questionNumber,
  }));

  const testObj = {
    _id: test._id,
    title: test.title,
    description: test.description,
    category: test.category,
    duration: test.duration,
    totalQuestions: test.totalQuestions,
    maxMarks: test.maxMarks,
    negativeMarking: test.negativeMarking,
    questions: sanitizedQuestions,
  };

  res.status(200).json(
    ApiResponse.success('Test started.', {
      attempt,
      test: testObj,
      questions: sanitizedQuestions,
    })
  );
});

/**
 * @desc    Submit a test attempt
 * @route   POST /api/tests/attempts/:attemptId/submit
 */
const submitTest = catchAsync(async (req, res) => {
  const { attemptId } = req.params;
  const { answers, timeTaken } = req.body;
  const userId = req.user._id;

  // Find the in-progress attempt
  const attempt = await TestAttempt.findById(attemptId);
  if (!attempt) {
    throw new ApiError(404, 'Test attempt not found.');
  }

  if (attempt.userId.toString() !== userId.toString()) {
    throw new ApiError(403, 'This attempt does not belong to you.');
  }

  if (attempt.status === 'completed') {
    throw new ApiError(400, 'This test has already been submitted.');
  }

  // Get the test and its questions
  const test = await MockTest.findById(attempt.testId);
  if (!test) {
    throw new ApiError(404, 'Test not found.');
  }

  const questions = await Question.find({ testId: attempt.testId });

  // Build a map of questionId -> question for quick lookup
  const questionMap = {};
  questions.forEach((q) => {
    questionMap[q._id.toString()] = q;
  });

  // Calculate scores
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  let totalScore = 0;

  const processedAnswers = questions.map((question) => {
    // Find user's answer for this question
    const userAnswer = answers
      ? answers.find(
          (a) => a.questionId && a.questionId.toString() === question._id.toString()
        )
      : null;

    const selectedOption =
      userAnswer && userAnswer.selectedOption !== null && userAnswer.selectedOption !== undefined
        ? userAnswer.selectedOption
        : null;

    let isCorrect = false;
    let marksAwarded = 0;

    if (selectedOption === null || selectedOption === undefined) {
      // Unanswered
      unansweredCount++;
      marksAwarded = 0;
    } else {
      // Check if the selected option is correct
      const correctOptionIndex = question.options.findIndex((opt) => opt.isCorrect);

      if (selectedOption === correctOptionIndex) {
        isCorrect = true;
        correctCount++;
        marksAwarded = question.marks;
      } else {
        incorrectCount++;
        marksAwarded = -(test.negativeMarking || 0);
      }
    }

    totalScore += marksAwarded;

    return {
      questionId: question._id,
      selectedOption,
      isCorrect,
      marksAwarded,
    };
  });

  const maxScore = test.maxMarks;
  const answeredCount = correctCount + incorrectCount;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 10000) / 100 : 0;

  // Update the attempt
  attempt.answers = processedAnswers;
  attempt.totalScore = Math.max(0, totalScore); // Don't go below 0
  attempt.maxScore = maxScore;
  attempt.correctAnswers = correctCount;
  attempt.incorrectAnswers = incorrectCount;
  attempt.unanswered = unansweredCount;
  attempt.accuracy = accuracy;
  attempt.timeTaken = timeTaken || 0;
  attempt.status = 'completed';
  attempt.completedAt = new Date();

  await attempt.save();

  const resultObj = {
    _id: attempt._id,
    totalScore: attempt.totalScore,
    maxScore: attempt.maxScore,
    correctAnswers: attempt.correctAnswers,
    incorrectAnswers: attempt.incorrectAnswers,
    unanswered: attempt.unanswered,
    accuracy: attempt.accuracy,
    timeTaken: attempt.timeTaken,
    status: attempt.status,
    completedAt: attempt.completedAt,
  };

  res.status(200).json(
    ApiResponse.success('Test submitted successfully.', {
      result: resultObj,
      attempt: attempt,
    })
  );
});

/**
 * @desc    Get a completed attempt result with full question details
 * @route   GET /api/tests/attempts/:attemptId/result
 */
const getAttemptResult = catchAsync(async (req, res) => {
  const { attemptId } = req.params;

  const attempt = await TestAttempt.findById(attemptId)
    .populate('testId', 'title category subject duration maxMarks negativeMarking')
    .populate('userId', 'name email');

  if (!attempt) {
    throw new ApiError(404, 'Test attempt not found.');
  }

  if (attempt.status !== 'completed') {
    throw new ApiError(400, 'This test attempt is still in progress.');
  }

  // Get full question details including correct answers and explanations
  const questions = await Question.find({ testId: attempt.testId._id }).sort({
    questionNumber: 1,
  });

  const questionsWithSolutions = questions.map((q) => {
    const userAns = (attempt.answers || []).find(
      (a) => a.questionId.toString() === q._id.toString()
    );
    return {
      _id: q._id,
      questionId: q._id,
      questionText: q.questionText,
      options: q.options,
      explanation: q.explanation,
      marks: q.marks,
      selectedOption: userAns ? userAns.selectedOption : null,
      isCorrect: userAns ? userAns.isCorrect : false,
    };
  });

  res.status(200).json(
    ApiResponse.success('Attempt result fetched.', {
      attempt,
      test: attempt.testId,
      questions,
      questionsWithSolutions,
    })
  );
});

/**
 * @desc    Get test history for the logged-in user
 * @route   GET /api/tests/history
 */
const getTestHistory = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user._id;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const total = await TestAttempt.countDocuments({
    userId,
    status: 'completed',
  });

  const attempts = await TestAttempt.find({
    userId,
    status: 'completed',
  })
    .sort({ completedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('testId', 'title category subject difficulty');

  res.status(200).json(
    ApiResponse.success('Test history fetched.', {
      attempts,
      history: attempts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  );
});

module.exports = {
  getTests,
  getTestById,
  startTest,
  submitTest,
  getAttemptResult,
  getTestHistory,
};

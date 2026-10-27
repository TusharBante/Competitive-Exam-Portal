const TestAttempt = require('../models/TestAttempt');
const MockTest = require('../models/MockTest');
const Post = require('../models/Post');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Get dashboard statistics for the logged-in user
 * @route   GET /api/dashboard
 */
const getDashboardStats = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Total attempts
  const totalAttempts = await TestAttempt.countDocuments({
    userId,
    status: 'completed',
  });

  // Average score and accuracy
  const avgStats = await TestAttempt.aggregate([
    { $match: { userId, status: 'completed' } },
    {
      $group: {
        _id: null,
        avgScore: { $avg: '$totalScore' },
        avgAccuracy: { $avg: '$accuracy' },
      },
    },
  ]);

  const avgScore = avgStats.length > 0 ? Math.round(avgStats[0].avgScore * 100) / 100 : 0;
  const avgAccuracy = avgStats.length > 0 ? Math.round(avgStats[0].avgAccuracy * 100) / 100 : 0;

  // Recent 5 results
  const recentResults = await TestAttempt.find({
    userId,
    status: 'completed',
  })
    .sort({ completedAt: -1 })
    .limit(5)
    .populate('testId', 'title category subject');

  // Attempted test IDs
  const attemptedTestIds = await TestAttempt.distinct('testId', { userId });

  // Recommended tests (not attempted yet)
  const recommendedTests = await MockTest.find({
    _id: { $nin: attemptedTestIds },
    isActive: true,
  })
    .limit(5)
    .select('title category subject difficulty duration totalQuestions');

  // Recent 5 community posts
  const recentPosts = await Post.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('author', 'name profileImage');

  res.status(200).json(
    ApiResponse.success('Dashboard stats fetched.', {
      overview: {
        totalAttempts,
        averageScore: avgScore,
        averageAccuracy: avgAccuracy,
      },
      totalAttempts,
      avgScore,
      avgAccuracy,
      recentResults,
      recommendedTests,
      recentPosts,
    })
  );
});

/**
 * @desc    Get performance chart data (last 10 attempts)
 * @route   GET /api/dashboard/performance-chart
 */
const getPerformanceChart = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const attempts = await TestAttempt.find({
    userId,
    status: 'completed',
  })
    .sort({ completedAt: -1 })
    .limit(10)
    .populate('testId', 'title category')
    .select('totalScore maxScore accuracy completedAt testId');

  // Reverse so chart shows oldest to newest (left to right)
  const chartData = attempts.reverse().map((attempt) => ({
    testTitle: attempt.testId ? attempt.testId.title : 'Deleted Test',
    category: attempt.testId ? attempt.testId.category : 'N/A',
    score: attempt.totalScore,
    maxScore: attempt.maxScore,
    accuracy: attempt.accuracy,
    date: attempt.completedAt,
  }));

  res.status(200).json(
    ApiResponse.success('Performance chart data fetched.', chartData)
  );
});

module.exports = {
  getDashboardStats,
  getPerformanceChart,
};

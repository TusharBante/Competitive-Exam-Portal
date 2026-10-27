const User = require('../models/User');
const Post = require('../models/Post');
const Reel = require('../models/Reel');
const TestAttempt = require('../models/TestAttempt');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * Helper: upload buffer to cloudinary with fallback for local dev
 */
const uploadToCloudinary = (buffer, folder, mimetype = 'image/jpeg') => {
  return new Promise((resolve) => {
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY.includes('1234567890')) {
      const base64 = buffer.toString('base64');
      return resolve({
        secure_url: `data:${mimetype};base64,${base64}`,
        public_id: `local_profile_${Date.now()}`,
      });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          console.warn('Cloudinary upload warning (using fallback data URI):', error.message);
          const base64 = buffer.toString('base64');
          return resolve({
            secure_url: `data:${mimetype};base64,${base64}`,
            public_id: `local_profile_${Date.now()}`,
          });
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * @desc    Get user profile with stats
 * @route   GET /api/profile
 */
const getProfile = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  // Get stats
  const testAttemptCount = await TestAttempt.countDocuments({
    userId,
    status: 'completed',
  });

  const postCount = await Post.countDocuments({ author: userId });
  const reelCount = await Reel.countDocuments({ creator: userId });

  // Average score
  const avgStats = await TestAttempt.aggregate([
    { $match: { userId, status: 'completed' } },
    {
      $group: {
        _id: null,
        avgScore: { $avg: '$totalScore' },
      },
    },
  ]);

  const avgScore =
    avgStats.length > 0 ? Math.round(avgStats[0].avgScore * 100) / 100 : 0;

  const profile = user.toObject();
  profile.stats = {
    testAttemptCount,
    postCount,
    reelCount,
    avgScore,
  };

  res.status(200).json(ApiResponse.success('Profile fetched.', { profile }));
});

/**
 * @desc    Update user profile
 * @route   PUT /api/profile
 */
const updateProfile = catchAsync(async (req, res) => {
  const { name, bio, education, examInterests } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (education !== undefined) user.education = education;
  if (examInterests !== undefined) {
    user.examInterests = Array.isArray(examInterests)
      ? examInterests
      : JSON.parse(examInterests);
  }

  // Handle profile image upload
  if (req.file) {
    // Delete old profile image from cloudinary
    if (user.profileImage && user.profileImage.publicId) {
      await cloudinary.uploader.destroy(user.profileImage.publicId);
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      'exam-portal/profiles'
    );
    user.profileImage = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  await user.save();

  res.status(200).json(
    ApiResponse.success('Profile updated.', { user })
  );
});

/**
 * @desc    Get posts by the current user (paginated)
 * @route   GET /api/profile/posts
 */
const getUserPosts = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user._id;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Post.countDocuments({ author: userId });

  const posts = await Post.find({ author: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('author', 'name profileImage');

  res.status(200).json(
    ApiResponse.success('User posts fetched.', {
      posts,
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
 * @desc    Get reels by the current user (paginated)
 * @route   GET /api/profile/reels
 */
const getUserReels = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user._id;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Reel.countDocuments({ creator: userId });

  const reels = await Reel.find({ creator: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('creator', 'name profileImage');

  res.status(200).json(
    ApiResponse.success('User reels fetched.', {
      reels,
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
 * @desc    Get performance analytics (subject-wise, category-wise, overall)
 * @route   GET /api/profile/analytics
 */
const getPerformanceAnalytics = catchAsync(async (req, res) => {
  const userId = req.user._id;

  // Overall stats
  const overallStats = await TestAttempt.aggregate([
    { $match: { userId, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalTests: { $sum: 1 },
        avgScore: { $avg: '$totalScore' },
        avgAccuracy: { $avg: '$accuracy' },
        totalCorrect: { $sum: '$correctAnswers' },
        totalIncorrect: { $sum: '$incorrectAnswers' },
        totalUnanswered: { $sum: '$unanswered' },
        avgTimeTaken: { $avg: '$timeTaken' },
      },
    },
  ]);

  // Category-wise breakdown
  const categoryWise = await TestAttempt.aggregate([
    { $match: { userId, status: 'completed' } },
    {
      $lookup: {
        from: 'mocktests',
        localField: 'testId',
        foreignField: '_id',
        as: 'test',
      },
    },
    { $unwind: '$test' },
    {
      $group: {
        _id: '$test.category',
        testsAttempted: { $sum: 1 },
        avgScore: { $avg: '$totalScore' },
        avgAccuracy: { $avg: '$accuracy' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Subject-wise performance
  const subjectWise = await TestAttempt.aggregate([
    { $match: { userId, status: 'completed' } },
    {
      $lookup: {
        from: 'mocktests',
        localField: 'testId',
        foreignField: '_id',
        as: 'test',
      },
    },
    { $unwind: '$test' },
    {
      $group: {
        _id: '$test.subject',
        testsAttempted: { $sum: 1 },
        avgScore: { $avg: '$totalScore' },
        avgAccuracy: { $avg: '$accuracy' },
      },
    },
    { $sort: { avgAccuracy: -1 } },
  ]);

  res.status(200).json(
    ApiResponse.success('Performance analytics fetched.', {
      overall: overallStats.length > 0 ? overallStats[0] : null,
      categoryWise,
      subjectWise,
    })
  );
});

module.exports = {
  getProfile,
  updateProfile,
  getUserPosts,
  getUserReels,
  getPerformanceAnalytics,
};

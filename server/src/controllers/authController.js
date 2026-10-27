const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'super_secret_exam_portal_jwt_key_2026_xyz', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Parse JWT_EXPIRES_IN to milliseconds for cookie maxAge
 */
const getMaxAge = () => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
  const value = parseInt(match[1]);
  const unit = match[2];
  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 's': return value * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
};

/**
 * Get cookie options
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: getMaxAge(),
});

/**
 * Send token response with cookie
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);

  // Remove password from output
  const userObj = user.toObject();
  delete userObj.password;

  res
    .status(statusCode)
    .cookie('token', token, getCookieOptions())
    .json(ApiResponse.success(message, { user: userObj, token }));
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'A user with this email already exists.');
  }

  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res, 'User registered successfully.');
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user and explicitly select password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  sendTokenResponse(user, 200, res, 'Logged in successfully.');
});

/**
 * @desc    Logout user (clear cookie)
 * @route   POST /api/auth/logout
 */
const logout = catchAsync(async (req, res) => {
  res
    .status(200)
    .cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    })
    .json(ApiResponse.success('Logged out successfully.'));
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 */
const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  const userData = user.toObject();
  userData.savedPostsCount = user.savedPosts ? user.savedPosts.length : 0;
  userData.savedReelsCount = user.savedReels ? user.savedReels.length : 0;

  res.status(200).json(ApiResponse.success('User profile fetched.', { user: userData }));
});

/**
 * @desc    Update password
 * @route   PUT /api/auth/password
 */
const updatePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Please provide current and new password.');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters.');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(ApiResponse.success('Password updated successfully.'));
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updatePassword,
};

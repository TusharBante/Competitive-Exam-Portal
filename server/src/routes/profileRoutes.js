const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getUserPosts,
  getUserReels,
  getPerformanceAnalytics,
} = require('../controllers/profileController');
const auth = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// All profile routes are protected
router.use(auth);

// GET /api/profile
router.get('/', getProfile);

// PUT /api/profile
router.put('/', uploadImage, updateProfile);

// GET /api/profile/posts
router.get('/posts', getUserPosts);

// GET /api/profile/reels
router.get('/reels', getUserReels);

// GET /api/profile/analytics
router.get('/analytics', getPerformanceAnalytics);

module.exports = router;

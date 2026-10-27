const express = require('express');
const router = express.Router();
const {
  createReel,
  getReels,
  getReelById,
  updateReel,
  deleteReel,
  toggleLike,
  addComment,
  deleteComment,
  toggleSave,
  getSavedReels,
  shareReel,
} = require('../controllers/reelController');
const { validateCreateReel, validateComment } = require('../validators/reelValidator');
const validate = require('../validators/validate');
const auth = require('../middleware/auth');
const { uploadVideo } = require('../middleware/upload');

// All reel routes are protected
router.use(auth);

// GET /api/reels
router.get('/', getReels);

// POST /api/reels
router.post('/', uploadVideo, validateCreateReel, validate, createReel);

// GET /api/reels/saved - must be before /:id
router.get('/saved', getSavedReels);

// GET /api/reels/:id
router.get('/:id', getReelById);

// PUT /api/reels/:id
router.put('/:id', updateReel);

// DELETE /api/reels/:id
router.delete('/:id', deleteReel);

// POST /api/reels/:id/like
router.post('/:id/like', toggleLike);

// POST /api/reels/:id/comments
router.post('/:id/comments', validateComment, validate, addComment);

// DELETE /api/reels/:id/comments/:commentId
router.delete('/:id/comments/:commentId', deleteComment);

// POST /api/reels/:id/save
router.post('/:id/save', toggleSave);

// GET /api/reels/:id/share
router.get('/:id/share', shareReel);

module.exports = router;

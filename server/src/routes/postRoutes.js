const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  toggleSave,
  getSavedPosts,
} = require('../controllers/postController');
const { validateCreatePost, validateComment } = require('../validators/postValidator');
const validate = require('../validators/validate');
const auth = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// All post routes are protected
router.use(auth);

// GET /api/posts
router.get('/', getPosts);

// POST /api/posts
router.post('/', uploadImage, validateCreatePost, validate, createPost);

// GET /api/posts/saved - must be before /:id
router.get('/saved', getSavedPosts);

// GET /api/posts/:id
router.get('/:id', getPostById);

// PUT /api/posts/:id
router.put('/:id', uploadImage, updatePost);

// DELETE /api/posts/:id
router.delete('/:id', deletePost);

// POST /api/posts/:id/like
router.post('/:id/like', toggleLike);

// POST /api/posts/:id/comments
router.post('/:id/comments', validateComment, validate, addComment);

// DELETE /api/posts/:id/comments/:commentId
router.delete('/:id/comments/:commentId', deleteComment);

// POST /api/posts/:id/save
router.post('/:id/save', toggleSave);

module.exports = router;

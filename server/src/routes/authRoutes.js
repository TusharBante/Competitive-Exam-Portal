const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updatePassword,
} = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const validate = require('../validators/validate');
const auth = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', validateRegister, validate, register);

// POST /api/auth/login
router.post('/login', validateLogin, validate, login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me
router.get('/me', auth, getMe);

// PUT /api/auth/password
router.put('/password', auth, updatePassword);

module.exports = router;

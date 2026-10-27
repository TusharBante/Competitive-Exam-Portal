const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const mockTestRoutes = require('./mockTestRoutes');
const postRoutes = require('./postRoutes');
const reelRoutes = require('./reelRoutes');
const profileRoutes = require('./profileRoutes');

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tests', mockTestRoutes);
router.use('/posts', postRoutes);
router.use('/reels', reelRoutes);
router.use('/profile', profileRoutes);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getPerformanceChart,
} = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// All dashboard routes are protected
router.use(auth);

// GET /api/dashboard
router.get('/', getDashboardStats);

// GET /api/dashboard/performance-chart
router.get('/performance-chart', getPerformanceChart);

module.exports = router;

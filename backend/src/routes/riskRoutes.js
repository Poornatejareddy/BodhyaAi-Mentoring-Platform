const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/risk/predict/:studentId
 * @desc    Calculate risk prediction for a student
 * @access  Mentors only
 */
router.post('/predict/:studentId', authorize('mentor'), riskController.predictStudentRisk);

/**
 * @route   GET /api/risk/student/:studentId
 * @desc    Get existing risk data for a student
 * @access  Mentors and the student themselves
 */
router.get('/student/:studentId', riskController.getStudentRisk);

/**
 * @route   POST /api/risk/batch
 * @desc    Batch predict risk for multiple students
 * @access  Mentors only
 */
router.post('/batch', authorize('mentor'), riskController.batchPredictRisk);

/**
 * @route   GET /api/risk/stats
 * @desc    Get risk statistics for dashboard
 * @access  Mentors only
 */
router.get('/stats', authorize('mentor'), riskController.getRiskStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const cogController = require('../controllers/cogController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/personality/submit
 * @desc    Submit BFI-44 personality survey
 * @access  Students only
 */
router.post('/submit', authorize('student'), cogController.submitPersonalitySurvey);

/**
 * @route   GET /api/personality/profile
 * @desc    Get own personality profile
 * @access  Students only
 */
router.get('/profile', authorize('student'), cogController.getOwnPersonalityProfile);

/**
 * @route   GET /api/personality/profile/:studentId
 * @desc    Get student personality profile (for mentors)
 * @access  Mentors only
 */
router.get('/profile/:studentId', authorize('mentor'), cogController.getStudentPersonalityProfile);

/**
 * @route   GET /api/personality/insights/:studentId
 * @desc    Get personality insights for risk analysis
 * @access  Internal/System use
 */
router.get('/insights/:studentId', cogController.getPersonalityInsights);

module.exports = router;

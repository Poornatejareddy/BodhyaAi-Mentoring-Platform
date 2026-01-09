const express = require('express');
const router = express.Router();
const cogController = require('../controllers/cogController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * Note: Public routes (link validation and submission) are defined at the bottom
 * and do NOT require authentication
 */

/**
 * @route   POST /api/personality/submit
 * @desc    Submit BFI-44 personality survey
 * @access  Students only
 */
router.post('/submit', protect, authorize('student'), cogController.submitPersonalitySurvey);

/**
 * @route   GET /api/personality/profile
 * @desc    Get own personality profile
 * @access  Students only
 */
router.get('/profile', protect, authorize('student'), cogController.getOwnPersonalityProfile);

/**
 * @route   GET /api/personality/profile/:studentId
 * @desc    Get student personality profile (for mentors)
 * @access  Mentors only
 */
router.get('/profile/:studentId', protect, authorize('mentor'), cogController.getStudentPersonalityProfile);

/**
 * @route   GET /api/personality/insights/:studentId
 * @desc    Get personality insights for risk analysis
 * @access  Internal/System use
 */
router.get('/insights/:studentId', cogController.getPersonalityInsights);

/**
 * @route   POST /api/personality/generate-link/:studentId
 * @desc    Generate survey link for a specific student (with optional email)
 * @access  Mentors only
 */
router.post('/generate-link/:studentId', protect, authorize('mentor'), cogController.generateSurveyLinkWithEmail);

/**
 * @route   GET /api/personality/my-students-results
 * @desc    Get personality results for all students under mentor
 * @access  Mentors only
 */
router.get('/my-students-results', protect, authorize('mentor'), cogController.getMentorStudentResults);

/**
 * @route   GET /api/personality/profile/:studentId/pdf
 * @desc    Download personality report as PDF
 * @access  Mentors only
 */
router.get('/profile/:studentId/pdf', protect, authorize('mentor'), cogController.downloadPersonalityPDF);

/**
 * @route   POST /api/personality/generate-links-bulk
 * @desc    Generate survey links for multiple students
 * @access  Mentors only
 */
router.post('/generate-links-bulk', protect, authorize('mentor'), cogController.generateBulkSurveyLinks);

/**
 * Public routes (no authentication required)
 */

/**
 * @route   GET /api/personality/link/:token
 * @desc    Validate survey link and get survey info
 * @access  Public
 */
router.get('/link/:token', cogController.getSurveyLinkInfo);

/**
 * @route   POST /api/personality/link/:token/submit
 * @desc    Submit personality survey via public link
 * @access  Public
 */
router.post('/link/:token/submit', cogController.submitSurveyViaLink);

module.exports = router;


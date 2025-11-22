const express = require('express');
const {
  updateMenteeData,
  calculateStudentRisk,
  getMyProfile,
  getMenteeById,
  generateClassReport
} = require('../controllers/mentorController');
const { generateStudentPDFReport, generateStudentCSVExport } = require('../services/reportService');
const { protect, authorize } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const { requireAssignedMentor, applyConsentFilterMiddleware } = require('../middleware/consentMiddleware');
const { assignMenteeToSelf } = require('../controllers/mentorController');

// This route lets a mentor assign a student to themselves

const router = express.Router();

router.get('/me', protect, authorize('mentor'), getMyProfile);
router.post('/report', protect, authorize('mentor'), audit('GENERATE_REPORT'), generateClassReport);
router.get('/report/pdf/:studentId', protect, authorize('mentor'), generateStudentPDFReport);
router.get('/report/csv/:studentId', protect, authorize('mentor'), generateStudentCSVExport);


// Mentor accessing specific student data - requires assigned mentor + consent filtering + audit
router.get(
  '/mentees/:studentId',
  protect,
  authorize('mentor'),
  requireAssignedMentor,
  applyConsentFilterMiddleware,
  audit('VIEW_PROFILE'),
  getMenteeById
);

router.put(
  '/mentees/:studentId',
  protect,
  authorize('mentor'),
  requireAssignedMentor,
  audit('UPDATE_PROFILE'),
  updateMenteeData
);

router.post(
  '/mentees/:studentId/calculate-risk',
  protect,
  authorize('mentor'),
  requireAssignedMentor,
  audit('UPDATE_RISK'),
  calculateStudentRisk
);

router.post('/me/assign-mentee', protect, authorize('mentor'), audit('ASSIGN_MENTOR'), assignMenteeToSelf);

module.exports = router;
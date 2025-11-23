const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getStudyPlan,
    getInterventions,
    getClassReport
} = require('../controllers/llmController');

// All routes require authentication
router.use(protect);

// Student routes
router.post('/study-plan', authorize('student'), getStudyPlan);

// Mentor routes
router.post('/interventions/:studentId', authorize('mentor', 'admin'), getInterventions);
router.post('/class-report', authorize('mentor', 'admin'), getClassReport);

module.exports = router;

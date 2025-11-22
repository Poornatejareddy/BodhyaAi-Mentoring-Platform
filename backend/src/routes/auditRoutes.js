const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getMyAuditLogs,
    getStudentAuditLogs,
    getAuditStats,
} = require('../controllers/auditController');

// Student routes
router.get('/my-logs', protect, authorize('student'), getMyAuditLogs);

// Mentor/Admin routes
router.get('/student/:studentId', protect, authorize('mentor', 'admin'), getStudentAuditLogs);

// Admin routes
router.get('/stats', protect, authorize('admin'), getAuditStats);

module.exports = router;

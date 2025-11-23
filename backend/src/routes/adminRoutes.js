const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const {
    assignMentee,
    reassignMentor,
    getDashboardStats,
    getAllUsers,
    createUser,
    updateUser,
    getAllStudents,
    getAllMentors,
    deleteUser,
    createCustomAlert,
    getAllAlerts,
    markAlertAsRead,
    deleteAlert,
    getAuditLogs,
} = require('../controllers/adminController');

const router = express.Router();

// All routes require admin authorization
router.use(protect, authorize('admin'));

// Dashboard stats
router.get('/dashboard-stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.post('/users', audit('CREATE_USER'), createUser);
router.put('/users/:userId', audit('UPDATE_USER'), updateUser);
router.delete('/users/:userId', audit('DELETE_USER'), deleteUser);

// Student management
router.get('/students', getAllStudents);

// Mentor management
router.get('/mentors', getAllMentors);

// Mentee assignment
router.post('/assign-mentee', audit('ASSIGN_MENTOR'), assignMentee);
router.put('/reassign-mentor', audit('REASSIGN_MENTOR'), reassignMentor);

// Alerts management
router.get('/alerts', getAllAlerts);
router.put('/alerts/:id/read', markAlertAsRead);
router.delete('/alerts/:id', deleteAlert);

// Audit logs
router.get('/audit-logs', getAuditLogs);

// Custom alerts
router.post('/create-alert', createCustomAlert);

module.exports = router;
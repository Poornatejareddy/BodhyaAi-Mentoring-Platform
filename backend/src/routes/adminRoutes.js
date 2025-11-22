const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const {
    assignMentee,
    getDashboardStats,
    getAllUsers,
    getAllStudents,
    getAllMentors,
    deleteUser,
    createCustomAlert,
} = require('../controllers/adminController');

const router = express.Router();

// All routes require admin authorization
router.use(protect, authorize('admin'));

// Dashboard stats
router.get('/dashboard-stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:userId', audit('DELETE_USER'), deleteUser);

// Student management
router.get('/students', getAllStudents);

// Mentor management
router.get('/mentors', getAllMentors);

// Mentee assignment
router.post('/assign-mentee', audit('ASSIGN_MENTOR'), assignMentee);

// Custom alerts
router.post('/create-alert', createCustomAlert);

module.exports = router;
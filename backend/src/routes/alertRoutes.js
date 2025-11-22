const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getMyAlerts,
    markAsRead,
    markAllAsRead,
    deleteAlert,
} = require('../controllers/alertController');

// All routes require authentication
router.use(protect);

// Get user's alerts
router.get('/my-alerts', getMyAlerts);

// Mark alert as read
router.put('/:alertId/read', markAsRead);

// Mark all alerts as read
router.put('/mark-all-read', markAllAsRead);

// Delete an alert
router.delete('/:alertId', deleteAlert);

module.exports = router;

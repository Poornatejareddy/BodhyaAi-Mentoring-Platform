const Alert = require('../models/Alert');
const Student = require('../models/Student');
const { emitAlertToUser } = require('../socket/socketServer');

/**
 * @desc    Get all alerts for the logged-in user
 * @route   GET /api/alerts/my-alerts
 * @access  Private
 */
exports.getMyAlerts = async (req, res) => {
    try {
        // Get pagination params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Optional filter by read status
        const filter = { recipient: req.user._id };
        if (req.query.read !== undefined) {
            filter.read = req.query.read === 'true';
        }

        // Optional filter by priority
        if (req.query.priority) {
            filter.priority = req.query.priority.toUpperCase();
        }

        // Get alerts
        const alerts = await Alert.find(filter)
            .populate('student', 'name usn department')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count
        const total = await Alert.countDocuments(filter);

        // Get unread count
        const unreadCount = await Alert.countDocuments({
            recipient: req.user._id,
            read: false,
        });

        res.status(200).json({
            success: true,
            data: alerts,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

/**
 * @desc    Mark an alert as read
 * @route   PUT /api/alerts/:alertId/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.alertId);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found',
            });
        }

        // Verify user owns this alert
        if (alert.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this alert',
            });
        }

        alert.read = true;
        alert.readAt = Date.now();
        await alert.save();

        res.status(200).json({
            success: true,
            data: alert,
        });
    } catch (error) {
        console.error('Error marking alert as read:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

/**
 * @desc    Mark all alerts as read
 * @route   PUT /api/alerts/mark-all-read
 * @access  Private
 */
exports.markAllAsRead = async (req, res) => {
    try {
        const result = await Alert.updateMany(
            { recipient: req.user._id, read: false },
            { read: true, readAt: Date.now() }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} alerts marked as read`,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error('Error marking all alerts as read:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

/**
 * @desc    Delete an alert
 * @route   DELETE /api/alerts/:alertId
 * @access  Private
 */
exports.deleteAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.alertId);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found',
            });
        }

        // Verify user owns this alert
        if (alert.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this alert',
            });
        }

        await alert.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Alert deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

/**
 * Helper function: Create and emit a new alert
 * @param {Object} alertData - Alert data
 * @returns {Promise<Alert>}
 */
exports.createAlert = async (alertData) => {
    try {
        const alert = await Alert.create(alertData);

        // Populate student info if present
        if (alert.student) {
            await alert.populate('student', 'name usn department');
        }

        // Emit to user via Socket.IO
        emitAlertToUser(alert.recipient.toString(), alert);

        return alert;
    } catch (error) {
        console.error('Error creating alert:', error);
        throw error;
    }
};

// At the end of admin Controller.js, add these functions

/**
 * @desc    Get all alerts for admin
 * @route   GET /api/admin/alerts
 * @access  Private (Admin only)
 */
exports.getAllAlerts = async (req, res) => {
    try {
        const { limit = 50, priority, read } = req.query;

        let query = {};
        if (priority) query.priority = priority.toUpperCase();
        if (read !== undefined) query.read = read === 'true';

        const alerts = await Alert.find(query)
            .populate('student', 'name usn department')
            .populate('recipient', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: alerts,
            count: alerts.length
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Mark alert as read
 * @route   PUT /api/admin/alerts/:id/read
 * @access  Private (Admin only)
 */
exports.markAlertAsRead = async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { read: true, readAt: new Date() },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ success: false, message: 'Alert not found' });
        }

        res.status(200).json({ success: true, data: alert });
    } catch (error) {
        console.error('Error marking alert as read:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Delete alert
 * @route   DELETE /api/admin/alerts/:id
 * @access  Private (Admin only)
 */
exports.deleteAlert = async (req, res) => {
    try {
        const alert = await Alert.findByIdAndDelete(req.params.id);

        if (!alert) {
            return res.status(404).json({ success: false, message: 'Alert not found' });
        }

        res.status(200).json({ success: true, message: 'Alert deleted successfully' });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get audit logs
 * @route   GET /api/admin/audit-logs
 * @access  Private (Admin only)
 */
exports.getAuditLogs = async (req, res) => {
    try {
        const { limit = 100, action, userRole } = req.query;

        let query = {};
        if (action) query.action = action;
        if (userRole) query.userRole = userRole;

        const logs = await AuditLog.find(query)
            .populate('user', 'name email')
            .populate('student', 'name usn')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: logs,
            count: logs.length
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

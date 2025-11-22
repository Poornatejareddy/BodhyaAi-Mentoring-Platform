const AuditLog = require('../models/AuditLog');
const Student = require('../models/Student');

/**
 * @desc    Get audit logs for the logged-in student
 * @route   GET /api/audit/my-logs
 * @access  Private (Students only)
 */
exports.getMyAuditLogs = async (req, res) => {
    try {
        // Find the student profile for the logged-in user
        const student = await Student.findOne({ user: req.user.id });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found',
            });
        }

        // Get pagination params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Optional filter by action type
        const filter = { student: student._id };
        if (req.query.action) {
            filter.action = req.query.action;
        }

        // Get audit logs
        const auditLogs = await AuditLog.find(filter)
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await AuditLog.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: auditLogs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get audit logs for a specific student (mentor/admin only)
 * @route   GET /api/audit/student/:studentId
 * @access  Private (Mentor/Admin)
 */
exports.getStudentAuditLogs = async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Get pagination params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Optional filter by action type
        const filter = { student: studentId };
        if (req.query.action) {
            filter.action = req.query.action;
        }

        // Get audit logs
        const auditLogs = await AuditLog.find(filter)
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await AuditLog.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: auditLogs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get audit log statistics
 * @route   GET /api/audit/stats
 * @access  Private (Admin only)
 */
exports.getAuditStats = async (req, res) => {
    try {
        // Get total logs count
        const totalLogs = await AuditLog.countDocuments();

        // Get logs by action type
        const logsByAction = await AuditLog.aggregate([
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);

        // Get logs by result
        const logsByResult = await AuditLog.aggregate([
            {
                $group: {
                    _id: '$result',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Get recent failed actions
        const recentFailures = await AuditLog.find({ result: 'FAILURE' })
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                totalLogs,
                logsByAction,
                logsByResult,
                recentFailures,
            },
        });
    } catch (error) {
        console.error('Error fetching audit stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

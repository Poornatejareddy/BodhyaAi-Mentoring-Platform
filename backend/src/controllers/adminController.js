const Mentor = require('../models/Mentor');
const Student = require('../models/Student');
const User = require('../models/User');
const Message = require('../models/Message');
const Alert = require('../models/Alert');
const AuditLog = require('../models/AuditLog');

/**
 * @desc    Assign a student to a mentor
 * @route   POST /api/admin/assign-mentee
 * @access  Private (Admin only)
 */
exports.assignMentee = async (req, res) => {
    const { mentorUserId, studentUserId } = req.body;
    try {
        const mentor = await Mentor.findOne({ user: mentorUserId });
        const student = await Student.findOne({ user: studentUserId });

        if (!mentor || !student) {
            return res.status(404).json({ message: 'Mentor or Student not found' });
        }

        // Add student to mentor's list and assign mentor to student
        mentor.mentees.addToSet(student._id);
        student.mentor = mentor._id;

        await mentor.save();
        await student.save();

        // Trigger assignment alert
        const { notifyMenteeAssignment } = require('../services/alertRules');
        notifyMenteeAssignment(student._id, mentor._id).catch(err =>
            console.error('Error notifying mentee assignment:', err)
        );

        res.status(200).json({ success: true, message: 'Mentee assigned successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Get system dashboard statistics
 * @route   GET /api/admin/dashboard-stats
 * @access  Private (Admin only)
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // User counts
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalMentors = await User.countDocuments({ role: 'mentor' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });

        // Student status counts
        const unassignedStudents = await Student.countDocuments({ mentor: null });
        const assignedStudents = await Student.countDocuments({ mentor: { $ne: null } });

        // Risk distribution
        const highRiskStudents = await Student.countDocuments({
            'academicRisk.prediction': { $in: ['HIGH', 'at-risk'] },
        });
        const mediumRiskStudents = await Student.countDocuments({
            'academicRisk.prediction': 'MEDIUM',
        });
        const lowRiskStudents = await Student.countDocuments({
            'academicRisk.prediction': { $in: ['LOW', 'no-risk'] },
        });

        // Message stats
        const totalMessages = await Message.countDocuments({ deleted: false });
        const unreadMessages = await Message.countDocuments({ read: false, deleted: false });

        // Alert stats
        const totalAlerts = await Alert.countDocuments();
        const unreadAlerts = await Alert.countDocuments({ read: false });
        const urgentAlerts = await Alert.countDocuments({ priority: 'URGENT', read: false });

        // Recent audit activity (last 24 hours)
        const recentAuditLogs = await AuditLog.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });

        // Active users (users with activity in last 7 days)
        const activeUsers = await AuditLog.distinct('user', {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        });

        res.status(200).json({
            success: true,
            data: {
                users: {
                    totalStudents,
                    totalMentors,
                    totalAdmins,
                    total: totalStudents + totalMentors + totalAdmins,
                },
                students: {
                    unassigned: unassignedStudents,
                    assigned: assignedStudents,
                    total: assignedStudents + unassignedStudents,
                },
                risk: {
                    high: highRiskStudents,
                    medium: mediumRiskStudents,
                    low: lowRiskStudents,
                },
                messages: {
                    total: totalMessages,
                    unread: unreadMessages,
                },
                alerts: {
                    total: totalAlerts,
                    unread: unreadAlerts,
                    urgent: urgentAlerts,
                },
                activity: {
                    recentAuditLogs,
                    activeUsersCount: activeUsers.length,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get all users with filters and pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Filter by role
        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get all students with detailed info
 * @route   GET /api/admin/students
 * @access  Private (Admin only)
 */
exports.getAllStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Optional filters
        const filter = {};
        if (req.query.assigned === 'false') {
            filter.mentor = null;
        } else if (req.query.assigned === 'true') {
            filter.mentor = { $ne: null };
        }

        if (req.query.riskLevel) {
            filter['academicRisk.prediction'] = req.query.riskLevel;
        }

        const students = await Student.find(filter)
            .populate('user', 'name email')
            .populate('mentor', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Student.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: students,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get all mentors with mentee count
 * @route   GET /api/admin/mentors
 * @access  Private (Admin only)
 */
exports.getAllMentors = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const mentors = await Mentor.find({})
            .populate('user', 'name email')
            .populate('mentees', 'name usn')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Mentor.countDocuments({});

        res.status(200).json({
            success: true,
            data: mentors,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching mentors:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

/**
 * @desc    Delete a user (and associated student/mentor profile)
 * @route   DELETE /api/admin/users/:userId
 * @access  Private (Admin only)
 */
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Delete associated profiles
        if (user.role === 'student') {
            await Student.deleteOne({ user: user._id });
        } else if (user.role === 'mentor') {
            await Mentor.deleteOne({ user: user._id });
        }

        // Delete user
        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

/**
 * @desc    Create a custom alert (admin broadcast)
 * @route   POST /api/admin/create-alert
 * @access  Private (Admin only)
 */
exports.createCustomAlert = async (req, res) => {
    try {
        const { recipientId, title, message, priority = 'MEDIUM', actionLink } = req.body;

        if (!recipientId || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Recipient ID, title, and message are required',
            });
        }

        // Get recipient
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Recipient not found',
            });
        }

        // Create alert
        const { createAndEmitAlert } = require('../services/alertRules');
        const alert = await createAndEmitAlert({
            type: 'CUSTOM',
            recipient: recipientId,
            recipientRole: recipient.role,
            title: title,
            message: message,
            priority: priority,
            actionLink: actionLink,
            metadata: {
                createdBy: req.user.name,
                createdByRole: 'admin',
            },
        });

        res.status(201).json({
            success: true,
            data: alert,
        });
    } catch (error) {
        console.error('Error creating custom alert:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};


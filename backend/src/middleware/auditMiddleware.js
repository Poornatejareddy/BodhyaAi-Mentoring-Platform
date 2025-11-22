const AuditLog = require('../models/AuditLog');

/**
 * Audit Logging Middleware
 * Creates audit log entries for sensitive operations
 */

/**
 * Helper function to create an audit log entry
 * @param {Object} params - Audit log parameters
 * @returns {Promise<AuditLog>}
 */
const createAuditLog = async ({
    user,
    userRole,
    student,
    action,
    metadata = {},
    ipAddress,
    userAgent,
    result = 'SUCCESS',
    errorMessage = null,
}) => {
    try {
        const auditLog = await AuditLog.create({
            user,
            userRole,
            student,
            action,
            metadata,
            ipAddress,
            userAgent,
            result,
            errorMessage,
        });
        return auditLog;
    } catch (error) {
        // Don't throw - audit logging failure shouldn't break the app
        console.error('Failed to create audit log:', error);
        return null;
    }
};

/**
 * Middleware factory for different audit actions
 * Usage: audit('VIEW_PROFILE')
 */
const audit = (action) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to capture response
        res.json = function (data) {
            // Determine result based on status code
            const result = res.statusCode >= 200 && res.statusCode < 300 ? 'SUCCESS' : 'FAILURE';

            // Extract student ID from various sources
            let studentId = null;
            if (req.params.studentId) {
                studentId = req.params.studentId;
            } else if (req.student && req.student._id) {
                studentId = req.student._id;
            } else if (data && data.data && data.data._id) {
                // Sometimes the student data is in the response
                studentId = data.data._id;
            }

            // Create audit log (async, don't wait)
            createAuditLog({
                user: req.user._id,
                userRole: req.user.role,
                student: studentId,
                action: action,
                metadata: {
                    endpoint: req.originalUrl,
                    method: req.method,
                    params: req.params,
                    query: req.query,
                },
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent'),
                result: result,
                errorMessage: !data.success ? data.message : null,
            }).catch(err => console.error('Audit log creation failed:', err));

            // Call original json method
            return originalJson(data);
        };

        next();
    };
};

/**
 * Manual audit logging function for use in controllers
 * @param {Object} req - Express request object
 * @param {String} action - Action type
 * @param {String} studentId - Student ID (optional)
 * @param {Object} metadata - Additional metadata (optional)
 */
const logAudit = async (req, action, studentId = null, metadata = {}) => {
    if (!req.user) {
        console.error('Cannot create audit log: req.user is undefined');
        return null;
    }

    return await createAuditLog({
        user: req.user._id,
        userRole: req.user.role,
        student: studentId,
        action: action,
        metadata: {
            endpoint: req.originalUrl,
            method: req.method,
            ...metadata,
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        result: 'SUCCESS',
    });
};

module.exports = {
    audit,
    logAudit,
    createAuditLog,
};

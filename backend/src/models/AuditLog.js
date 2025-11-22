const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * AuditLog Model
 * Tracks all sensitive data access for compliance and transparency
 * Students can view their own audit logs to see who accessed their data
 */
const auditLogSchema = new Schema(
    {
        // Who performed the action
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // User's role at time of action
        userRole: {
            type: String,
            enum: ['student', 'mentor', 'admin'],
            required: true,
        },

        // Which student's data was accessed (if applicable)
        student: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
        },

        // Type of action performed
        action: {
            type: String,
            required: true,
            enum: [
                'VIEW_PROFILE',
                'UPDATE_PROFILE',
                'VIEW_RISK',
                'UPDATE_RISK',
                'VIEW_PERSONALITY',
                'VIEW_BEHAVIOR',
                'VIEW_CHAT',
                'SEND_MESSAGE',
                'VIEW_ACADEMIC_HISTORY',
                'UPDATE_ACADEMIC_HISTORY',
                'VIEW_CONSENT_SETTINGS',
                'UPDATE_CONSENT_SETTINGS',
                'ASSIGN_MENTOR',
                'EXPORT_DATA',
            ],
        },

        // Additional context/metadata
        metadata: {
            type: Map,
            of: Schema.Types.Mixed,
            default: {},
        },

        // IP address (for security tracking)
        ipAddress: String,

        // User agent (browser/device info)
        userAgent: String,

        // Result of the action
        result: {
            type: String,
            enum: ['SUCCESS', 'FAILURE', 'DENIED'],
            default: 'SUCCESS',
        },

        // Error message if action failed
        errorMessage: String,
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Index for efficient queries
auditLogSchema.index({ student: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

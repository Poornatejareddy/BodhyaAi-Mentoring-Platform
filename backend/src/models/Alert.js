const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Alert Model
 * Stores system-generated alerts for mentors and students
 * Alerts are triggered by rules (high risk, attendance drop, inactivity, etc.)
 */
const alertSchema = new Schema(
    {
        // Alert type/category
        type: {
            type: String,
            required: true,
            enum: [
                'HIGH_RISK',           // Student flagged with high academic risk
                'ATTENDANCE_DROP',     // Significant drop in attendance
                'BEHAVIOR_ALERT',      // Unusual behavior pattern detected
                'MENTOR_INACTIVITY',   // No mentor action in 48+ hours
                'LOW_PERFORMANCE',     // Academic performance decline
                'CONSENT_CHANGED',     // Student changed consent settings
                'NEW_MENTEE_ASSIGNED', // New student assigned to mentor
                'MENTEE_REASSIGNED',   // Student reassigned to new mentor
                'MESSAGE_RECEIVED',    // New chat message (optional notification)
                'SURVEY_COMPLETED',    // Student completed personality survey
                'ACADEMIC',            // Academic/risk-related alerts
                'CUSTOM',              // Custom alert from admin
            ],
        },

        // Which student the alert is about (if applicable)
        student: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
        },

        // Who should receive this alert (mentor or student)
        recipient: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Recipient role for easier filtering
        recipientRole: {
            type: String,
            enum: ['student', 'mentor', 'admin'],
            required: true,
        },

        // Alert title
        title: {
            type: String,
            required: true,
        },

        // Alert message/description
        message: {
            type: String,
            required: true,
        },

        // Priority level
        priority: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            default: 'MEDIUM',
        },

        // Read status
        read: {
            type: Boolean,
            default: false,
        },

        // When was it read (if applicable)
        readAt: Date,

        // Additional metadata (e.g., old value, new value, threshold crossed)
        metadata: {
            type: Map,
            of: Schema.Types.Mixed,
            default: {},
        },

        // Link/action for the alert (e.g., /mentees/abc123)
        actionLink: String,

        // Expiry date (optional - auto-delete old alerts)
        expiresAt: Date,
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Indexes for efficient queries
alertSchema.index({ recipient: 1, read: 1, createdAt: -1 });
alertSchema.index({ student: 1, type: 1 });
alertSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

module.exports = mongoose.model('Alert', alertSchema);

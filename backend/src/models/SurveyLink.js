const mongoose = require('mongoose');
const { Schema } = mongoose;
const crypto = require('crypto');

const surveyLinkSchema = new Schema(
    {
        // Unique token for the survey link
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
            default: () => crypto.randomBytes(32).toString('hex')
        },

        // Mentor who generated this link
        mentor: {
            type: Schema.Types.ObjectId,
            ref: 'Mentor',
            required: true,
        },

        // Target student for this survey
        student: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },

        // Survey completion status
        isUsed: {
            type: Boolean,
            default: false,
        },

        // When the survey was completed
        completedAt: {
            type: Date,
        },

        // Optional expiration date for the link
        expiresAt: {
            type: Date,
        },

        // Metadata
        metadata: {
            ipAddress: String,
            userAgent: String,
        },
    },
    { timestamps: true }
);

// Check if link is valid (not used and not expired)
surveyLinkSchema.methods.isValid = function () {
    if (this.isUsed) {
        return { valid: false, reason: 'This survey has already been completed' };
    }

    if (this.expiresAt && this.expiresAt < new Date()) {
        return { valid: false, reason: 'This survey link has expired' };
    }

    return { valid: true };
};

// Mark link as used
surveyLinkSchema.methods.markAsUsed = async function (metadata = {}) {
    this.isUsed = true;
    this.completedAt = new Date();
    this.metadata = metadata;
    return await this.save();
};

// Index for efficient queries
surveyLinkSchema.index({ mentor: 1, student: 1 });
surveyLinkSchema.index({ createdAt: 1 });

module.exports = mongoose.model('SurveyLink', surveyLinkSchema);

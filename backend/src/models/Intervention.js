const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor',
        required: true
    },
    type: {
        type: String,
        enum: ['MEETING', 'TASK', 'COUNSELING', 'ACADEMIC_PLAN', 'FOLLOW_UP', 'OTHER'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'],
        default: 'MEDIUM'
    },
    status: {
        type: String,
        enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'PLANNED'
    },
    scheduledDate: {
        type: Date
    },
    completedDate: {
        type: Date
    },
    deadline: {
        type: Date
    },
    notes: [{
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    outcome: {
        type: String
    },
    followUpRequired: {
        type: Boolean,
        default: false
    },
    tags: [String]
}, {
    timestamps: true
});

// Index for faster queries
interventionSchema.index({ student: 1, mentor: 1 });
interventionSchema.index({ status: 1 });
interventionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Intervention', interventionSchema);

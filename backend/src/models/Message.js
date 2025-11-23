const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Message Model
 * Stores chat messages between students and mentors
 */
const messageSchema = new Schema(
    {
        // Sender (user who sent the message)
        sender: {
            type: Schema.Types.Mixed, // Allow ObjectId or "ai-bot" string
            required: true,
        },

        // Sender role for easier filtering
        senderRole: {
            type: String,
            enum: ['student', 'mentor', 'admin', 'ai'],
            required: true,
        },

        // Receiver (user who should receive the message)
        receiver: {
            type: Schema.Types.Mixed,
            required: true,
        },

        // Receiver role
        receiverRole: {
            type: String,
            enum: ['student', 'mentor', 'admin', 'ai'],
            required: true,
        },

        // Related student (for mentor-student conversations)
        student: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
        },

        // Message content
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },

        // Message type
        messageType: {
            type: String,
            enum: ['text', 'file', 'system', 'ai-suggestion'],
            default: 'text',
        },

        // File attachments (for file messages)
        fileAttachments: [
            {
                fileName: String,
                fileUrl: String,
                fileType: String, // image/png, application/pdf, etc.
                fileSize: Number, // in bytes
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Read status
        read: {
            type: Boolean,
            default: false,
        },

        // When was it read
        readAt: Date,

        // For AI-generated messages
        aiMetadata: {
            type: Map,
            of: Schema.Types.Mixed,
        },

        // Soft delete (for user privacy)
        deleted: {
            type: Boolean,
            default: false,
        },

        // Edit tracking
        edited: {
            type: Boolean,
            default: false,
        },
        editedAt: {
            type: Date,
        },

        deletedAt: Date,
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Indexes for efficient queries
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ student: 1, createdAt: -1 });
messageSchema.index({ read: 1, receiver: 1 });

// Virtual for conversation participants
messageSchema.virtual('participants').get(function () {
    return [this.sender, this.receiver];
});

module.exports = mongoose.model('Message', messageSchema);

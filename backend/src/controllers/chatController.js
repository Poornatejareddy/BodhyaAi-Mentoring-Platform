const axios = require('axios');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const Message = require('../models/Message');
const { checkChatConsent } = require('../middleware/consentMiddleware');
const { emitMessageToUser } = require('../socket/socketServer');

/**
 * @desc    Send a message (student-mentor or with AI)
 * @route   POST /api/chat/send
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text' } = req.body;

    if (!content || !receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and message content are required',
      });
    }

    // Validate consent if mentor-student chat (skip for AI bot)
    if (req.user.role === 'mentor' && receiverId !== 'ai-bot') {
      // Check if receiverId is a valid ObjectId before querying
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(receiverId)) {
        const student = await Student.findOne({ user: receiverId });
        if (student) {
          const consentCheck = await checkChatConsent(student._id, req.user._id);
          if (!consentCheck.allowed) {
            return res.status(403).json({
              success: false,
              message: consentCheck.reason,
            });
          }
        }
      }
    }

    // Get receiver to determine role (skip for AI bot)
    if (receiverId === 'ai-bot') {
      return res.status(400).json({
        success: false,
        message: 'Please use /api/chat/ai-chat endpoint for AI conversations',
      });
    }

    const User = require('../models/User');
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
    }

    // Create message
    const message = await Message.create({
      sender: req.user._id,
      senderRole: req.user.role,
      receiver: receiverId,
      receiverRole: receiver.role,
      content: content,
      messageType: messageType,
      read: false,
    });

    // Populate sender info
    await message.populate('sender', 'name email role');

    // Emit via Socket.IO
    emitMessageToUser(receiverId, message);

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get chat history between two users
 * @route   GET /api/chat/history/:userId
 * @access  Private
 */
exports.getChatHistory = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Find messages between these two users
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
      deleted: false,
    })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
      deleted: false,
    });

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark messages as read
 * @route   PUT /api/chat/mark-read/:userId
 * @access  Private
 */
exports.markMessagesAsRead = async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    const result = await Message.updateMany(
      {
        sender: otherUserId,
        receiver: req.user._id,
        read: false,
      },
      {
        read: true,
        readAt: Date.now(),
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} messages marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get unread message count
 * @route   GET /api/chat/unread-count
 * @access  Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false,
      deleted: false,
    });

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get AI chat response (student asking for help)
 * @route   POST /api/chat/ai
 * @access  Private
 */
exports.handleAIChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Get student context if user is a student
    let studentContext = {};
    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.user._id }).lean();
      if (studentProfile) {
        studentContext = {
          cgpa: studentProfile.riskInputs?.CGPA || 'N/A',
          attendance: studentProfile.riskInputs?.Attendance || 'N/A',
          risk: studentProfile.academicRisk?.prediction || 'UNKNOWN',
          role: 'student',
        };
      }
    } else {
      studentContext = { role: req.user.role };
    }

    // Call RAG service
    try {
      const ragResponse = await axios.post('http://localhost:8003/rag/chat', {
        message: message,
        student_id: req.user._id,
        context: studentContext,
      });

      if (ragResponse.data.success) {
        // Save AI message to database
        const aiMessage = await Message.create({
          sender: null, // AI has no sender
          receiver: req.user._id,
          content: ragResponse.data.reply,
          messageType: 'text',
          isAI: true,
          aiMetadata: {
            confidence: ragResponse.data.confidence || 0,
            model: 'rag-enhanced',
          },
        });

        // Emit to user via Socket.IO
        emitMessageToUser(req.user._id, {
          event: 'new:message',
          data: {
            ...aiMessage.toObject(),
            sender: { name: 'BodhyaAI Assistant', role: 'ai' },
          },
        });

        return res.status(200).json({
          success: true,
          reply: ragResponse.data.reply,
          confidence: ragResponse.data.confidence,
        });
      }
    } catch (ragError) {
      console.error('RAG service error:', ragError.message);
      // Fall through to fallback
    }

    // Fallback response if RAG service fails
    const fallbackReply = "I'm here to help! I can assist with study strategies, time management, exam preparation, and more. What would you like to know?";

    const fallbackMessage = await Message.create({
      sender: null,
      receiver: req.user._id,
      content: fallbackReply,
      messageType: 'text',
      isAI: true,
    });

    emitMessageToUser(req.user._id, {
      event: 'new:message',
      data: {
        ...fallbackMessage.toObject(),
        sender: { name: 'BodhyaAI Assistant', role: 'ai' },
      },
    });

    res.status(200).json({ success: true, reply: fallbackReply });
  } catch (error) {
    console.error('--- ERROR in handleAIChat ---');
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing AI chat',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a message (soft delete)
 * @route   DELETE /api/chat/:messageId
 * @access  Private
 */
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Verify user owns this message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message',
      });
    }

    message.deleted = true;
    message.deletedAt = Date.now();
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};
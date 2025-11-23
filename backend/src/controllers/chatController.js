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

    // Manually fetch sender and receiver User data (populate doesn't work with Mixed types)
    const senderUser = await User.findById(req.user._id).select('name email role').lean();
    const receiverUser = receiverId !== 'ai-bot'
      ? await User.findById(receiverId).select('name email role').lean()
      : null;

    const messageObject = {
      _id: message._id.toString(),
      sender: senderUser || { _id: req.user._id },
      senderRole: message.senderRole,
      receiver: receiverUser || receiverId,
      receiverRole: message.receiverRole,
      content: message.content,
      messageType: message.messageType,
      read: message.read,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };

    // Debug: Log what we're sending
    console.log('Emitting message to user:', receiverId);
    console.log('Sender data:', JSON.stringify(messageObject.sender));

    // Emit via Socket.IO
    emitMessageToUser(receiverId, messageObject);

    res.status(201).json({
      success: true,
      data: messageObject,
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
 * @desc    Edit a message
 * @route   PUT /api/chat/edit/:messageId
 * @access  Private
 */
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user is the sender
    if (String(message.sender) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages',
      });
    }

    // Update message
    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    // Fetch sender and receiver data
    const User = require('../models/User');
    const senderUser = await User.findById(message.sender).select('name email role').lean();
    const receiverUser = message.receiver !== 'ai-bot'
      ? await User.findById(message.receiver).select('name email role').lean()
      : null;

    const messageObject = {
      _id: message._id.toString(),
      sender: senderUser || message.sender,
      senderRole: message.senderRole,
      receiver: receiverUser || message.receiver,
      receiverRole: message.receiverRole,
      content: message.content,
      messageType: message.messageType,
      read: message.read,
      edited: message.edited,
      editedAt: message.editedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };

    // Emit edit event via Socket.IO
    const { emitMessageEdit } = require('../socket/socketServer');
    emitMessageEdit(String(message.receiver), messageObject);

    res.status(200).json({
      success: true,
      data: messageObject,
    });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/chat/delete/:messageId
 * @access  Private
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Check if user is the sender
    if (String(message.sender) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      });
    }

    // Soft delete - mark as deleted instead of removing
    message.deleted = true;
    message.content = 'This message was deleted';
    await message.save();

    // Emit delete event via Socket.IO
    const { emitMessageDelete } = require('../socket/socketServer');
    emitMessageDelete(String(message.receiver), messageId);

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

/**
 * @desc    Get chat history between two users
 * @route   GET /api/chat/history/:userId
 * @access  Private
 */
exports.getChatHistory = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user._id;

    console.log('=== GET CHAT HISTORY ===');
    console.log('Current user:', currentUserId);
    console.log('Other user:', otherUserId);

    const mongoose = require('mongoose');

    // Convert to both ObjectId and string to handle mixed storage
    const currentUserIdObj = mongoose.Types.ObjectId.isValid(String(currentUserId))
      ? new mongoose.Types.ObjectId(String(currentUserId))
      : null;
    const otherUserIdObj = mongoose.Types.ObjectId.isValid(String(otherUserId))
      ? new mongoose.Types.ObjectId(String(otherUserId))
      : null;

    const currentUserIdStr = String(currentUserId);
    const otherUserIdStr = String(otherUserId);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Find messages - query for both ObjectId and string formats
    const messages = await Message.find({
      $or: [
        {
          sender: { $in: [currentUserIdObj, currentUserIdStr] },
          receiver: { $in: [otherUserIdObj, otherUserIdStr] }
        },
        {
          sender: { $in: [otherUserIdObj, otherUserIdStr] },
          receiver: { $in: [currentUserIdObj, currentUserIdStr] }
        },
      ],
      deleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for plain objects

    console.log('Found messages:', messages.length);
    console.log('First 3 message sender IDs:', messages.slice(0, 3).map(m => ({
      sender: m.sender,
      receiver: m.receiver,
      senderRole: m.senderRole
    })));

    const total = await Message.countDocuments({
      $or: [
        {
          sender: { $in: [currentUserIdObj, currentUserIdStr] },
          receiver: { $in: [otherUserIdObj, otherUserIdStr] }
        },
        {
          sender: { $in: [otherUserIdObj, otherUserIdStr] },
          receiver: { $in: [currentUserIdObj, currentUserIdStr] }
        },
      ],
      deleted: false,
    });

    // Manually populate sender and receiver for each message
    const User = require('../models/User');
    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        const senderUser = await User.findById(msg.sender).select('name email role').lean();
        const receiverUser = msg.receiver !== 'ai-bot'
          ? await User.findById(msg.receiver).select('name email role').lean()
          : null;

        return {
          ...msg,
          sender: senderUser || msg.sender,
          receiver: receiverUser || msg.receiver,
        };
      })
    );

    console.log('After population, first 3 senders:', populatedMessages.slice(0, 3).map(m => m.sender));

    res.status(200).json({
      success: true,
      data: populatedMessages.reverse(), // Reverse to show oldest first
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
/**
 * @desc    Get AI chat response (student asking for help)
 * @route   POST /api/chat/ai
 * @access  Private
 */
exports.handleAIChat = async (req, res) => {
  try {
    const { message } = req.body;
    const llmService = require('../services/llmService');

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // -------------------------
    // 0) Save User Message
    // -------------------------
    const userMessage = await Message.create({
      sender: req.user._id,
      senderRole: req.user.role,
      receiver: "ai-bot", // Using string ID for AI bot
      receiverRole: "ai",
      content: message,
      messageType: 'text',
      read: true, // AI "reads" it immediately
      readAt: Date.now()
    });

    // -------------------------
    // 1) Build Context
    // -------------------------
    let contextData = {};

    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.user._id }).lean();

      if (studentProfile) {
        contextData = {
          role: 'student',
          name: studentProfile.name,
          academic: {
            cgpa: studentProfile.riskInputs?.CGPA || 'N/A',
            attendance: studentProfile.riskInputs?.Attendance || 'N/A',
            backlogs: studentProfile.riskInputs?.Backlogs || 0,
            sgpa: studentProfile.academicHistory?.sgpa || {},
          },
          risk: {
            level: studentProfile.academicRisk?.prediction || 'UNKNOWN',
            insights: studentProfile.academicRisk?.insights || [],
            warnings: studentProfile.academicRisk?.warnings || [],
          },
          personality: studentProfile.personalityProfile?.predictions || {},
        };
      }
    } else if (req.user.role === 'mentor') {
      const mentorProfile = await Mentor.findOne({ user: req.user._id }).populate('mentees');

      if (mentorProfile) {
        // 1. General Mentee Summary
        const menteeSummary = mentorProfile.mentees.map(m => ({
          name: m.name,
          usn: m.usn,
          risk: m.academicRisk?.prediction || 'UNKNOWN',
          cgpa: m.riskInputs?.CGPA || 'N/A'
        }));

        contextData = {
          role: 'mentor',
          department: mentorProfile.department,
          mentees_summary: menteeSummary
        };

        // 2. Check if message mentions a specific student
        const messageLower = message.toLowerCase();
        const mentionedStudent = mentorProfile.mentees.find(m => {
          if (!m || !m.name) return false;
          return messageLower.includes(m.name.toLowerCase());
        });

        if (mentionedStudent) {
          contextData.focused_student = {
            name: mentionedStudent.name,
            usn: mentionedStudent.usn,
            academic: {
              cgpa: mentionedStudent.riskInputs?.CGPA || 'N/A',
              attendance: mentionedStudent.riskInputs?.Attendance || 'N/A',
              backlogs: mentionedStudent.riskInputs?.Backlogs || 0,
              sgpa: mentionedStudent.academicHistory?.sgpa || {},
            },
            risk: {
              level: mentionedStudent.academicRisk?.prediction || 'UNKNOWN',
              insights: mentionedStudent.academicRisk?.insights || [],
              warnings: mentionedStudent.academicRisk?.warnings || [],
            },
            personality: mentionedStudent.personalityProfile?.predictions || {},
            survey: mentionedStudent.surveyResponses || {}
          };
        }
      }
    } else {
      contextData = { role: req.user.role };
    }

    // -------------------------
    // 2) Get AI Response via Service
    // -------------------------
    try {
      const aiResponse = await llmService.chat(message, req.user._id, contextData);

      if (aiResponse.success) {
        const replyText = aiResponse.reply;

        // -------------------------
        // SAVE AI MESSAGE (RAG)
        // -------------------------
        const aiMessage = await Message.create({
          sender: "ai-bot",              // REQUIRED
          senderRole: "ai",              // REQUIRED
          receiver: req.user._id,
          receiverRole: req.user.role,   // REQUIRED
          content: replyText,
          messageType: 'text',
          isAI: true,
          aiMetadata: {
            confidence: aiResponse.confidence || 0,
            model: aiResponse.model || "rag-enhanced"
          }
        });

        // Emit to user's socket
        emitMessageToUser(req.user._id, {
          ...aiMessage.toObject(),
          sender: { name: "BodhyaAI Assistant", role: "ai" }
        });

        return res.status(200).json({
          success: true,
          reply: replyText,
          confidence: aiResponse.confidence
        });
      }
    } catch (ragError) {
      console.error("LLM Service error:", ragError.message);
      // Fallback continues below
    }

    // -------------------------------------------------------
    // 3) FALLBACK AI RESPONSE (if Service fails)
    // -------------------------------------------------------
    const fallbackReply =
      "I'm here to help! I can assist with study strategies, time management, exam preparation, and more. What would you like to know?";

    const fallbackMessage = await Message.create({
      sender: "ai-bot",
      senderRole: "ai",
      receiver: req.user._id,
      receiverRole: req.user.role,
      content: fallbackReply,
      messageType: 'text',
      isAI: true,
      aiMetadata: {
        confidence: 0,
        model: "fallback-basic"
      }
    });

    // Emit fallback
    emitMessageToUser(req.user._id, {
      ...fallbackMessage.toObject(),
      sender: { name: "BodhyaAI Assistant", role: "ai" }
    });

    return res.status(200).json({
      success: true,
      reply: fallbackReply
    });

  } catch (error) {
    console.error('--- ERROR in handleAIChat ---');
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Server error while processing AI chat',
      error: error.message
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
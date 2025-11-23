const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware');
const {
    sendMessage,
    getChatHistory,
    markMessagesAsRead,
    getUnreadCount,
    handleAIChat,
    editMessage,
    deleteMessage,
} = require('../controllers/chatController');

// All routes require authentication
router.use(protect);

// Send a message
router.post('/send', audit('SEND_MESSAGE'), sendMessage);

// Get chat history with another user
router.get('/history/:userId', audit('VIEW_CHAT'), getChatHistory);

// Mark messages as read
router.put('/mark-read/:userId', markMessagesAsRead);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// AI chat route
router.post('/ai-chat', handleAIChat);

// Edit and delete routes
router.put('/edit/:messageId', editMessage);
router.delete('/delete/:messageId', deleteMessage);

module.exports = router;
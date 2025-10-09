const express = require('express');
const { handleChat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All chat routes are protected, requiring a user to be logged in
router.post('/', protect, handleChat);

module.exports = router;
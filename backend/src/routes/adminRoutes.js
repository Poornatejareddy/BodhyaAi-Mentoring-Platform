const express = require('express');
const { assignMentee } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/assign-mentee', protect, authorize('admin'), assignMentee);

module.exports = router;
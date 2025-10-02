const express = require('express');
const { 
  updateMenteeData, 
  calculateStudentRisk,
  getMyProfile,      
  getMenteeById     
} = require('../controllers/mentorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { assignMenteeToSelf } = require('../controllers/mentorController'); 

// This route lets a mentor assign a student to themselves

const router = express.Router();

router.get('/me', protect, authorize('mentor'), getMyProfile);
router.get('/mentees/:studentId', protect, authorize('mentor'), getMenteeById);
router.put('/mentees/:studentId', protect, authorize('mentor'), updateMenteeData);
router.post('/mentees/:studentId/calculate-risk', protect, authorize('mentor'), calculateStudentRisk);
router.post('/me/assign-mentee', protect, authorize('mentor'), assignMenteeToSelf);

module.exports = router;
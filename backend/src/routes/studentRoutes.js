const express = require('express');
const { updateMyProfile, submitSurvey , getMyProfile} = require('../controllers/studentController'); // <-- Import submitSurvey
const { protect, authorize } = require('../middleware/authMiddleware');
const { getUnassignedStudents } = require('../controllers/studentController'); // Import

// Add this route, accessible by mentors and admins

const router = express.Router();


router.get('/my-profile', protect, authorize('student'), getMyProfile); // <-- ADD THIS

router.put('/my-profile', protect, authorize('student'), updateMyProfile);

// New route for submitting the survey
router.post('/my-profile/survey', protect, authorize('student'), submitSurvey); 
router.get('/unassigned', protect, authorize('mentor', 'admin'), getUnassignedStudents);


module.exports = router;
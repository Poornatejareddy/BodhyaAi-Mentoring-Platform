const express = require('express');
const {
    updateMyProfile,
    submitSurvey,
    getMyProfile,
    getUnassignedStudents,
    updateConsent
} = require('../controllers/studentController');

const { getRiskExplanation } = require('../controllers/riskExplanationController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware'); // <-- Import audit middleware


const router = express.Router();

// Public Routes (if any, typically none)

// Student Routes
router.get('/my-profile', protect, authorize('student'), audit('VIEW_PROFILE'), getMyProfile);
router.put('/my-profile', protect, authorize('student'), audit('UPDATE_PROFILE'), updateMyProfile);

// Route for submitting the personality survey
router.post('/my-profile/survey', protect, authorize('student'), audit('UPDATE_PROFILE'), submitSurvey);

// Route for updating consent settings
router.put('/my-profile/consent', protect, authorize('student'), audit('UPDATE_CONSENT_SETTINGS'), updateConsent);

// Route for getting student's risk explanation
router.get('/my-profile/risk-explanation', protect, authorize('student'), audit('VIEW_RISK_EXPLANATION'), getRiskExplanation);

// Route to trigger the academic risk calculation
// Admin/Mentor Routes
router.get('/unassigned', protect, authorize('mentor', 'admin'), getUnassignedStudents);


module.exports = router;
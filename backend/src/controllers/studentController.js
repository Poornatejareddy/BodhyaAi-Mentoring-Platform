const Student = require('../models/Student');
const axios = require('axios');

// @desc    Update the logged-in student's own profile
// @route   PUT /api/students/my-profile
// @access  Private (Students only)
exports.updateMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // -----------------------------------------------
    // 1. Update core profile fields (NEW FIELDS ADDED)
    // -----------------------------------------------
    const coreFields = ['name', 'usn', 'department', 'section'];
    coreFields.forEach(field => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    // ----------------------------------------------------
    // 2. Update riskInputs (self-reported / numeric fields)
    // ----------------------------------------------------
    const riskInputUpdates = [
      'CGPA', 'Attendance', 'StressScore', 'SleepHours', 'StudyHoursPerDay',
      'FatherIncome', 'MotherIncome', 'HasSiblings', 'SiblingCount',
      'MentalHealthIndex', 'ExerciseHours', 'ScreenTime',
      'InternetAccess', 'PartTimeJob', 'SocialHours'
    ];

    riskInputUpdates.forEach(key => {
      if (req.body[key] !== undefined) {
        student.riskInputs[key] = req.body[key];
      }
    });

    // ----------------------------------------------------
    // 3. Update Academic History (SGPA & IAT Maps)
    // ----------------------------------------------------

    // SGPA Map
    if (req.body.sgpa && typeof req.body.sgpa === 'object') {
      const sgpaMap = student.academicHistory.sgpa || new Map();
      for (const [key, value] of Object.entries(req.body.sgpa)) {
        if (typeof value === 'number' && key.startsWith('Sem')) {
          sgpaMap.set(key, value);
        }
      }
      student.academicHistory.sgpa = sgpaMap;
    }

    // IAT Map
    if (req.body.iat && typeof req.body.iat === 'object') {
      const iatMap = student.academicHistory.internalAssessments || new Map();
      for (const [key, value] of Object.entries(req.body.iat)) {
        if (typeof value === 'number' && key.startsWith('IAT')) {
          iatMap.set(key, value);
        }
      }
      student.academicHistory.internalAssessments = iatMap;
    }

    // Parent Education
    if (req.body.parentEducation !== undefined) {
      student.academicHistory.parentEducation = req.body.parentEducation;
    }

    // ----------------------------------------------------
    // 4. Support Engagement Inputs
    // ----------------------------------------------------
    const supportFields = ['clubParticipation', 'mentorMeetings', 'counselingSessions'];
    supportFields.forEach(field => {
      if (req.body[field] !== undefined) {
        student.supportEngagement[field] = req.body[field];
      }
    });

    // Save before triggering alerts
    const oldAttendance = student.riskInputs?.Attendance;
    const oldCGPA = student.riskInputs?.CGPA;

    await student.save();

    // ----------------------------------------------------
    // 5. TRIGGER ALERT RULES (Async - don't wait)
    // ----------------------------------------------------
    const {
      checkAttendanceDropAlert,
      checkLowPerformanceAlert,
    } = require('../services/alertRules');

    // Check attendance alert
    if (req.body.Attendance !== undefined && oldAttendance !== undefined) {
      checkAttendanceDropAlert(student._id, oldAttendance, req.body.Attendance).catch(err =>
        console.error('Error triggering attendance alert:', err)
      );
    }

    // Check performance alert
    if (req.body.CGPA !== undefined && oldCGPA !== undefined) {
      checkLowPerformanceAlert(student._id, oldCGPA, req.body.CGPA).catch(err =>
        console.error('Error triggering performance alert:', err)
      );
    }

    res.status(200).json({ success: true, data: student });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// =====================================================================
// SUBMIT SURVEY + CALL COG-SVC + CALL XAI-SVC
// =====================================================================

// @desc    Submit survey responses and update personality profile
// @route   POST /api/students/my-profile/survey
// @access  Private
exports.submitSurvey = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const surveyAnswers = req.body.answers;

    if (!surveyAnswers || Object.keys(surveyAnswers).length < 50) {
      return res.status(400).json({
        success: false,
        message: 'All 50 survey answers are required'
      });
    }

    // Save raw survey answers
    student.surveyResponses = surveyAnswers;

    // COG-SVC call
    const cogResponse = await axios.post(
      'http://localhost:8001/predict',
      surveyAnswers
    );
    const personalityPredictions = cogResponse.data.predictions;
    const extendedProfile = cogResponse.data.extended_profile;

    // XAI-SVC call
    const xaiResponse = await axios.post(
      'http://localhost:8002/explain/cog-extended',
      surveyAnswers
    );
    const personalityInsights = xaiResponse.data.insights;

    // Save AI results
    student.personalityProfile = {
      predictions: personalityPredictions,
      learningStyle: extendedProfile.learningStyle,
      strengths: extendedProfile.strengths,
      growthAreas: extendedProfile.growthAreas,
      careerSuggestions: extendedProfile.careerSuggestions,
      insights: personalityInsights,
      lastCalculated: Date.now(),
    };

    await student.save();

    res.status(200).json({
      success: true,
      data: student.personalityProfile
    });

  } catch (error) {
    console.error('Error in submitSurvey:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// =====================================================================
// GET UNASSIGNED STUDENTS
// =====================================================================

exports.getUnassignedStudents = async (req, res) => {
  try {
    const students = await Student.find({ mentor: { $exists: false } })
      .populate('user', 'name email');

    res.status(200).json({ success: true, data: students });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// =====================================================================
// GET MY PROFILE
// =====================================================================

// @desc    Get logged-in student's complete profile
// @route   GET /api/students/my-profile
// @access  Private
exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('user', 'name email')
      .populate({
        path: 'mentor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// =====================================================================
// UPDATE CONSENT SETTINGS
// =====================================================================

// @desc    Update consent settings
// @route   PUT /api/students/my-profile/consent
// @access  Private (Students only)
exports.updateConsent = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Update consent fields
    const consentFields = [
      'shareRisk',
      'sharePersonality',
      'shareBehavior',
      'shareAcademicHistory',
      'allowChat',
      'shareWithResearch'
    ];

    consentFields.forEach(field => {
      if (req.body[field] !== undefined) {
        student.consent[field] = req.body[field];
      }
    });

    await student.save();

    // Trigger consent change alert to mentor (async)
    const { notifyConsentChange } = require('../services/alertRules');
    if (student.mentor) {
      const changes = {};
      consentFields.forEach(field => {
        if (req.body[field] !== undefined) {
          changes[field] = req.body[field];
        }
      });

      notifyConsentChange(student._id, changes).catch(err =>
        console.error('Error notifying consent change:', err)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Consent settings updated successfully',
      data: student.consent
    });

  } catch (error) {
    console.error('Error updating consent:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// =====================================================================
// GET FULL STUDENT PROFILE (for Mentor Dashboard)
// =====================================================================

// @desc    Get complete student profile with risk, personality, and academic data
// @route   GET /api/students/:id/full-profile
// @access  Private (Mentors only)
exports.getFullProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate('user', 'name email')
      .populate({
        path: 'mentor',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Build response with consent-aware data
    const response = {
      success: true,
      data: {
        // Basic Info (always visible)
        studentId: student._id,
        name: student.name,
        usn: student.usn,
        department: student.department,
        section: student.section,
        email: student.user.email,
        mentor: student.mentor,

        // Academic History (consent-based)
        academicHistory: student.consent.shareAcademicHistory
          ? student.academicHistory
          : null,

        // Risk Data (consent-based)
        academicRisk: student.consent.shareRisk
          ? student.academicRisk
          : {
            message: 'Student has not consented to share risk data',
          },

        // Personality Profile (consent-based)
        personalityProfile: student.consent.sharePersonality
          ? student.personalityProfile
          : {
            message: 'Student has not consented to share personality data',
          },

        // Risk Inputs (consent-based)
        riskInputs: student.consent.shareRisk
          ? student.riskInputs
          : null,

        // Support Engagement
        supportEngagement: student.supportEngagement,

        // Consent Status
        consentStatus: student.consent,

        // Timestamps
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching full student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};


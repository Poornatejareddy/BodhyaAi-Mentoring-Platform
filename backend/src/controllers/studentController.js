const Student = require('../models/Student');
const axios = require('axios'); // Import axios

// @desc    Update the logged-in student's own profile
// @route   PUT /api/students/my-profile
// @access  Private (Students only)
exports.updateMyProfile = async (req, res) => {
  try {
    // Find the student profile linked to the logged-in user
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Define which fields the student is allowed to update
    const allowedUpdates = [
      'StressScore', 'SleepHours', 'StudyHoursPerDay',
      'FatherIncome', 'MotherIncome', 'HasSiblings', 'SiblingCount',
      'MentalHealthIndex', 'ExerciseHours', 'ScreenTime'
    ];
    
    // Update the fields
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        student.riskInputs[key] = req.body[key];
      }
    }

    await student.save();
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};


// @desc    Submit survey, get profile from cog-svc, and get insights from xai-svc
// @route   POST /api/students/my-profile/survey
// @access  Private (Students only)
exports.submitSurvey = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const surveyAnswers = req.body.answers;
    if (!surveyAnswers || Object.keys(surveyAnswers).length < 50) {
      return res.status(400).json({ success: false, message: 'All 50 survey answers are required' });
    }

    // 1. Save the raw answers to the database
    student.surveyResponses = surveyAnswers;

    // 2. Call the external cog-svc to get the personality profile
    const cogSvcUrl = 'http://localhost:8001/predict'; // Your cog-svc URL
    const cogResponse = await axios.post(cogSvcUrl, surveyAnswers);
    const personalityPredictions = cogResponse.data.predictions;

    // 3. Call the external xai-svc to get insights for the profile
    const xaiSvcUrl = 'http://localhost:8002/explain/cog-extended'; // Your xai-svc URL
    const xaiResponse = await axios.post(xaiSvcUrl, surveyAnswers);
    const personalityInsights = xaiResponse.data.insights;

    // 4. Save the combined results to the student's profile
    student.personalityProfile = {
      predictions: personalityPredictions,
      insights: personalityInsights,
      lastCalculated: Date.now(),
    };

    await student.save();

    // 5. Send the updated profile back to the frontend
    res.status(200).json({ success: true, data: student.personalityProfile });

  } catch (error) {
    console.error('Error in submitSurvey:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get a list of all students not assigned to any mentor
// @route   GET /api/students/unassigned
// @access  Private (Mentors and Admins)
exports.getUnassignedStudents = async (req, res) => {
  try {
    // Find students where the 'mentor' field is null or does not exist
    const students = await Student.find({ mentor: { $exists: false } })
      .populate('user', 'name email');
      
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// @desc    Get the logged-in student's own complete profile
// @route   GET /api/students/my-profile
// @access  Private (Students only)
exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
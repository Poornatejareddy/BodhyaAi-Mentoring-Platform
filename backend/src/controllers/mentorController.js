const Mentor = require('../models/Mentor');
const Student = require('../models/Student');
const axios = require('axios'); // Ensure axios is imported

// @desc    Update a specific mentee's academic data
// @route   PUT /api/mentors/mentees/:studentId
// @access  Private (Mentors only)
exports.updateMenteeData = async (req, res) => {
  try {
    // 1. Find the mentor profile for the logged-in user
    const mentor = await Mentor.findOne({ user: req.user.id });
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor profile not found' });
    }

    // 2. Check if the student is actually assigned to this mentor (CRITICAL security check)
    const studentId = req.params.studentId;
    if (!mentor.mentees.includes(studentId)) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this student' });
    }

    // 3. Find the student to update
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // 4. Define which fields the mentor can update
    const allowedUpdates = [
      'CGPA',
      'Attendance',
      'Backlogs',
      'StudyHoursPerDay',
      'SleepHours',
      'StressScore',
      'MentalHealthIndex',
      'PhysicalActivity',
      'SocialSupport',
      'FamilyIncome',
      'ExtracurricularParticipation'
    ];
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


// @desc    Calculate and save the academic risk for a specific student
// @route   POST /api/mentors/mentees/:studentId/calculate-risk
// @access  Private (Mentors only)
exports.calculateStudentRisk = async (req, res) => {
  try {
    const riskService = require('../services/riskService');
    const Alert = require('../models/Alert');

    const studentId = req.params.studentId;

    // Get student data (middleware already verified mentor relationship)
    const student = await Student.findById(studentId).populate('user', 'name email').populate('mentor');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Call AI risk prediction service
    const predictionResult = await riskService.predictRisk(student.riskInputs || {});

    // Get explainability insights from XAI service
    const xaiService = require('../services/xaiService');
    const explanation = await xaiService.generateFullExplanation(
      student.riskInputs || {},
      predictionResult.prediction
    );

    // Update student's academic risk with prediction AND explanations
    student.academicRisk = {
      prediction: predictionResult.prediction,
      confidence: predictionResult.confidence,
      calculatedAt: new Date(),
      calculatedBy: req.user.id,
      model: predictionResult.model,
      warnings: explanation.warnings || [],
      insights: explanation.insights || [],
      recommendations: explanation.recommendations || [],
    };

    await student.save({ validateModifiedOnly: true });

    // Create HIGH risk alert if needed
    if (predictionResult.prediction === 'HIGH' && student.mentor) {
      const existingAlert = await Alert.findOne({
        recipient: student.mentor.user, // Mentor's user ID
        type: 'ACADEMIC',
        read: false,
        createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      });

      if (!existingAlert) {
        await Alert.create({
          recipient: student.mentor.user, // Mentor's user ID
          recipientRole: 'mentor',
          sender: req.user.id, // System/mentor who triggered calculation
          type: 'ACADEMIC',
          priority: 'URGENT',
          title: 'High Academic Risk Detected',
          message: `${student.user.name} identified as HIGH risk. CGPA: ${student.riskInputs?.CGPA || 'N/A'}, Attendance: ${student.riskInputs?.Attendance || 'N/A'}%`,
          actionRequired: true,
          read: false,
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        studentId: student._id,
        studentName: student.user.name,
        prediction: predictionResult.prediction,
        confidence: predictionResult.confidence,
        model: predictionResult.model,
        timestamp: predictionResult.timestamp,
      },
    });
  } catch (error) {
    console.error('Error calculating student risk:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate risk',
      error: error.message,
    });
  }
};





// @desc    Get a single mentee's full profile by their ID
// @route   GET /api/mentors/mentees/:studentId
// @access  Private (Mentors only)
exports.getMenteeById = async (req, res) => {
  // We can reuse the security check from our update function
  // (You could refactor this into its own middleware later)
  try {
    const mentor = await Mentor.findOne({ user: req.user.id });
    const studentId = req.params.studentId;

    if (!mentor || !mentor.mentees.includes(studentId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this student' });
    }

    const student = await Student.findById(studentId).populate('user', 'name email');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// @desc    Allow a logged-in mentor to assign an unassigned student to themselves
// @route   POST /api/mentors/me/assign-mentee
// @access  Private (Mentors only)
exports.assignMenteeToSelf = async (req, res) => {
  try {
    const { studentId } = req.body;
    const mentor = await Mentor.findOne({ user: req.user.id });

    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor profile not found' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    if (student.mentor) {
      return res.status(400).json({ success: false, message: 'Student is already assigned to a mentor' });
    }

    // Perform the assignment
    student.mentor = mentor._id;
    mentor.mentees.addToSet(student._id);

    await student.save();
    await mentor.save();

    // Trigger mentee assignment alert (async)
    const { notifyMenteeAssignment } = require('../services/alertRules');
    notifyMenteeAssignment(student._id, mentor._id).catch(err =>
      console.error('Error notifying mentee assignment:', err)
    );

    res.status(200).json({ success: true, message: 'Student assigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// ...
// @desc    Get the logged-in mentor's profile and their list of mentees
// @route   GET /api/mentors/me
// @access  Private (Mentors only)
exports.getMyProfile = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ user: req.user.id })
      .populate({
        path: 'mentees', // 1. In the Mentor doc, find the 'mentees' array of IDs.
        populate: {
          path: 'user',   // 2. For each mentee, go to their 'user' field.
          select: 'name email' // 3. From the User doc, get only the name and email.
        }
      });

    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor profile not found' });
    }
    res.status(200).json({ success: true, data: mentor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Generate AI-driven class report
// @route   POST /api/mentors/report
// @access  Private (Mentors only)
exports.generateClassReport = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ user: req.user.id });
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor profile not found' });
    }

    // Aggregate student data
    const classData = [];
    // We need to fetch mentees manually or populate them. 
    // Since mentor.mentees is an array of IDs, let's fetch them.
    const students = await Student.find({ _id: { $in: mentor.mentees } });

    for (const student of students) {
      classData.push({
        id: student._id,
        cgpa: student.riskInputs?.CGPA || 0,
        attendance: student.riskInputs?.Attendance || 0,
        risk: student.academicRisk?.prediction || 'UNKNOWN',
      });
    }

    // Call LLM Service
    // Note: In production, use an environment variable for the LLM service URL
    const llmResponse = await axios.post('http://localhost:8003/rag/report', {
      mentor_id: mentor._id,
      class_data: classData,
      focus_area: req.body.focus_area || 'general'
    });

    if (llmResponse.data.success) {
      res.status(200).json({
        success: true,
        report: llmResponse.data.report,
        confidence: llmResponse.data.confidence
      });
    } else {
      throw new Error(llmResponse.data.error || 'LLM service returned failure');
    }

  } catch (error) {
    console.error('Error generating class report:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
  }
};
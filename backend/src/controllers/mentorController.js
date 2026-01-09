const Mentor = require('../models/Mentor');
const Student = require('../models/Student');
const axios = require('axios'); // Ensure axios is imported

// @desc    Update a specific mentee's academic data
// @route   PUT /api/mentors/mentees/:studentId
// @access  Private (Mentors only)
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

    // 4. Update fields based on where they belong in the schema
    const {
      // Academic
      CGPA, Attendance, Backlogs, StudyHoursPerDay, IAT1, IAT2, IAT3,
      // Socio-economic
      FatherIncome, MotherIncome, ParentEducation, InternetAccess, PartTimeJob,
      // Lifestyle
      StressScore, SleepHours, MentalHealthIndex, ExerciseHours, ScreenTime, SocialHours,
      // Engagement
      ClubParticipation, MentorMeetings, CounselingSessions
    } = req.body;

    // Update riskInputs (for risk-svc)
    if (!student.riskInputs) student.riskInputs = {};

    const riskFields = [
      'CGPA', 'Attendance', 'Backlogs', 'StudyHoursPerDay', 'IAT1', 'IAT2', 'IAT3',
      'FatherIncome', 'MotherIncome', 'StressScore', 'SleepHours', 'MentalHealthIndex',
      'ExerciseHours', 'ScreenTime', 'SocialHours'
    ];

    riskFields.forEach(field => {
      if (req.body[field] !== undefined) student.riskInputs[field] = req.body[field];
    });

    // Handle booleans/categorical in riskInputs
    if (InternetAccess !== undefined) student.riskInputs.InternetAccess = InternetAccess === 'Yes';
    if (PartTimeJob !== undefined) student.riskInputs.PartTimeJob = PartTimeJob === 'Yes';

    // Update Academic History
    if (!student.academicHistory) student.academicHistory = {};
    if (ParentEducation !== undefined) student.academicHistory.parentEducation = ParentEducation;

    // Update Support Engagement
    if (!student.supportEngagement) student.supportEngagement = {};
    if (ClubParticipation !== undefined) student.supportEngagement.clubParticipation = ClubParticipation === 'Yes' ? 1 : 0;
    if (MentorMeetings !== undefined) student.supportEngagement.mentorMeetings = MentorMeetings;
    if (CounselingSessions !== undefined) student.supportEngagement.counselingSessions = CounselingSessions;

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
    console.log('\n🚀 [CALCULATE-RISK] ========== START ==========');
    console.log(`🆔 [CALCULATE-RISK] Student ID: ${req.params.studentId}`);
    console.log(`👤 [CALCULATE-RISK] Requested by: ${req.user.id}`);

    const riskService = require('../services/riskService');
    const Alert = require('../models/Alert');

    const studentId = req.params.studentId;

    // Get student data (middleware already verified mentor relationship)
    const student = await Student.findById(studentId).populate('user', 'name email').populate('mentor');
    if (!student) {
      console.log('❌ [CALCULATE-RISK] Student not found');
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    console.log(`📋 [CALCULATE-RISK] Student found: ${student.user?.name}`);
    console.log(`📊 [CALCULATE-RISK] Current risk inputs:`, JSON.stringify(student.riskInputs, null, 2));

    // Prepare comprehensive student data for risk service
    const riskData = {
      ...student.riskInputs?.toObject(),
      ParentEducation: student.academicHistory?.parentEducation,
      ClubParticipation: student.supportEngagement?.clubParticipation ? 'Yes' : 'No',
      MentorMeetings: student.supportEngagement?.mentorMeetings,
      CounselingSessions: student.supportEngagement?.counselingSessions,
      InternetAccess: student.riskInputs?.InternetAccess ? 'Yes' : 'No',
      PartTimeJob: student.riskInputs?.PartTimeJob ? 'Yes' : 'No'
    };

    console.log(`🔄 [CALCULATE-RISK] Prepared risk data for service:`, JSON.stringify(riskData, null, 2));

    // Call AI risk prediction service
    console.log('📡 [CALCULATE-RISK] Calling riskService.predictRisk...');
    const predictionResult = await riskService.predictRisk(riskData);
    console.log('✅ [CALCULATE-RISK] Got prediction result:', JSON.stringify(predictionResult, null, 2));

    // Get explainability insights from XAI service
    console.log('🧠 [CALCULATE-RISK] Calling xaiService...');
    const xaiService = require('../services/xaiService');
    const explanation = await xaiService.generateFullExplanation(
      riskData,
      predictionResult.prediction
    );
    console.log('✅ [CALCULATE-RISK] Got XAI explanation');

    // Update student's academic risk with prediction AND explanations
    student.academicRisk = {
      prediction: predictionResult.prediction,
      confidence: predictionResult.confidence,
      calculatedAt: new Date(),
      calculatedBy: req.user.id,
      model: predictionResult.model,
      warnings: (function () {
        const w = explanation.warnings || [];
        if (predictionResult.overrideReason) {
          w.push(predictionResult.overrideReason);
        }
        return w;
      })(),
      insights: explanation.insights || [],
      recommendations: explanation.recommendations || [],
      featureContributions: predictionResult.featureContributions || []
    };

    console.log('💾 [CALCULATE-RISK] Saving student with new academicRisk:', JSON.stringify(student.academicRisk, null, 2));

    // DEBUG: Write to file
    const fs = require('fs');
    try {
      fs.appendFileSync('/home/poornatejareddy007/Desktop/BodhyaAI /bodhyai/backend/debug_risk.log',
        `\n[${new Date().toISOString()}] Student ID: ${studentId}\n` +
        `Prediction: ${JSON.stringify(predictionResult, null, 2)}\n` +
        `Saving Risk: ${JSON.stringify(student.academicRisk, null, 2)}\n` +
        '---------------------------------------------------\n'
      );
    } catch (e) { console.error('Error writing debug log:', e); }

    await student.save({ validateModifiedOnly: true });
    console.log('✅ [CALCULATE-RISK] Student saved successfully');

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
        console.log('🚨 [CALCULATE-RISK] Created HIGH risk alert');
      }
    }

    console.log('🏁 [CALCULATE-RISK] ========== END ==========\n');

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
    console.error('❌ [CALCULATE-RISK] ERROR:', error);
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
    console.log('\n📖 [GET-MENTEE] ========== START ==========');
    console.log(`🆔 [GET-MENTEE] Student ID: ${req.params.studentId}`);

    const mentor = await Mentor.findOne({ user: req.user.id });
    const studentId = req.params.studentId;

    if (!mentor || !mentor.mentees.includes(studentId)) {
      console.log('❌ [GET-MENTEE] Unauthorized');
      return res.status(403).json({ success: false, message: 'Unauthorized to view this student' });
    }

    const student = await Student.findById(studentId).populate('user', 'name email');
    if (!student) {
      console.log('❌ [GET-MENTEE] Student not found');
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    console.log(`✅ [GET-MENTEE] Returning student: ${student.user?.name}`);
    console.log(`📊 [GET-MENTEE] Academic Risk:`, {
      prediction: student.academicRisk?.prediction,
      confidence: student.academicRisk?.confidence,
      calculatedAt: student.academicRisk?.calculatedAt,
      warningsCount: student.academicRisk?.warnings?.length
    });
    console.log('🏁 [GET-MENTEE] ========== END ==========\n');

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error('❌ [GET-MENTEE] ERROR:', error);
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

// @desc    Get real-time dashboard statistics
// @route   GET /api/mentors/dashboard-stats
// @access  Private (Mentors only)
exports.getDashboardStats = async (req, res) => {
  try {
    const Message = require('../models/Message');
    const Alert = require('../models/Alert');

    const mentor = await Mentor.findOne({ user: req.user.id });
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor profile not found' });
    }

    // 1. Get Mentees Stats
    const mentees = await Student.find({ _id: { $in: mentor.mentees } });
    const totalMentees = mentees.length;

    // 2. Calculate Risk Counts, Avg CGPA, and Distributions
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    let totalCGPA = 0;
    let cgpaCount = 0;

    // Distributions for Charts
    const attendanceDist = { low: 0, medium: 0, high: 0 }; // <75, 75-85, >85
    const cgpaDist = { low: 0, medium: 0, high: 0 }; // <6, 6-8, >8

    mentees.forEach(student => {
      // Risk Counting (Case Insensitive)
      const risk = student.academicRisk?.prediction?.toUpperCase() || 'UNKNOWN';
      if (risk === 'HIGH') highRiskCount++;
      else if (risk === 'MEDIUM') mediumRiskCount++;
      else if (risk === 'LOW') lowRiskCount++;

      // CGPA Calculation & Distribution
      if (student.riskInputs?.CGPA) {
        const cgpa = student.riskInputs.CGPA;
        totalCGPA += cgpa;
        cgpaCount++;

        if (cgpa < 6.0) cgpaDist.low++;
        else if (cgpa < 8.0) cgpaDist.medium++;
        else cgpaDist.high++;
      }

      // Attendance Distribution
      if (student.riskInputs?.Attendance) {
        const att = student.riskInputs.Attendance;
        if (att < 75) attendanceDist.low++;
        else if (att < 85) attendanceDist.medium++;
        else attendanceDist.high++;
      }
    });

    const avgCGPA = cgpaCount > 0 ? (totalCGPA / cgpaCount).toFixed(2) : '0.00';

    // 3. Get Unread Messages Count
    // Count messages where receiver is the mentor (user ID) and read is false
    const unreadMessages = await Message.countDocuments({
      receiver: req.user.id,
      read: false
    });

    // 4. Get Pending Alerts Count
    // Count alerts where recipient is the mentor and read is false
    const pendingAlerts = await Alert.countDocuments({
      recipient: req.user.id,
      read: false
    });

    res.status(200).json({
      success: true,
      data: {
        totalMentees,
        riskCounts: {
          HIGH: highRiskCount,
          MEDIUM: mediumRiskCount,
          LOW: lowRiskCount
        },
        avgCGPA,
        distributions: {
          attendance: attendanceDist,
          cgpa: cgpaDist
        },
        unreadMessages,
        pendingAlerts
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
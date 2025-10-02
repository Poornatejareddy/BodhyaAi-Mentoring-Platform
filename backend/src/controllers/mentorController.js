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
    const allowedUpdates = ['CGPA', 'Attendance', 'Backlogs'];
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
    // 1. Verify mentor and mentee relationship (security check)
    const mentor = await Mentor.findOne({ user: req.user.id });
    const studentId = req.params.studentId;

    if (!mentor || !mentor.mentees.includes(studentId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // 2. Get the student's data from the database
    const student = await Student.findById(studentId);
    if (!student || !student.riskInputs) {
      return res.status(404).json({ success: false, message: 'Student data not found or incomplete' });
    }

    const riskInputs = student.riskInputs;

    // 3. Call the external risk-svc for the prediction
    const riskSvcUrl = 'http://localhost:8000/predict'; // Your risk-svc URL
    const riskResponse = await axios.post(riskSvcUrl, riskInputs);
    const prediction = riskResponse.data.prediction;

    // 4. Call the external xai-svc for the explanation
    const xaiSvcUrl = 'http://localhost:8002/explain/risk'; // Your xai-svc URL
    const xaiResponse = await axios.post(xaiSvcUrl, riskInputs);
    const { warnings, feature_importance } = xaiResponse.data;
    
    // 5. Save the complete, explained results to the student's profile
    student.academicRisk = {
      prediction: prediction,
      warnings: warnings,
      featureImportance: feature_importance,
      lastCalculated: Date.now(),
    };

    await student.save();

    // 6. Send the new risk profile back as a response
    res.status(200).json({ success: true, data: student.academicRisk });

  } // Inside the calculateStudentRisk function...
   catch (error) {
    // --- THIS IS THE NEW, MORE DETAILED LOGGING ---
    console.error('--- DETAILED ERROR in calculateStudentRisk ---');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error Message:', error.message);
    }
    console.error('--- END OF ERROR ---');
    // --- END OF NEW LOGGING ---

    res.status(500).json({ success: false, message: 'Server Error' });
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
// ...
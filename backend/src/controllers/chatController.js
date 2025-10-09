const axios = require('axios');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor'); // Optional: For adding mentor context later

// @desc    Handle chat messages from any logged-in user
// @route   POST /api/chat
// @access  Private
exports.handleChat = async (req, res) => {
  try {
    const { message, docs } = req.body;
    const user = req.user; // User data is attached by the 'protect' middleware

    // Basic validation
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    let contextString = "";

    // 1. GATHER CONTEXT: Based on the user's role, fetch relevant data.
    if (user.role === 'student') {
      const studentProfile = await Student.findOne({ user: user.id });
      if (studentProfile) {
        const gpa = studentProfile.riskInputs?.CGPA;
        const riskLevel = studentProfile.academicRisk?.prediction;
        
        // Build a simple string with the student's data
        if (gpa) contextString += `Current GPA: ${gpa}. `;
        if (riskLevel) contextString += `Academic Risk Level: ${riskLevel}.`;
      }
    } else if (user.role === 'mentor') {
      // Future enhancement: You could add context for mentors,
      // for example, by summarizing data for their assigned mentees.
      contextString = "User is a mentor. Provide concise, professional insights.";
    }

    // 2. PREPARE PAYLOAD: Create the request object for the Python llm-svc.
    const llmSvcUrl = 'http://127.0.0.1:8004/chat'; // Ensure this URL and port are correct
    const payload = {
      role: user.role,
      userId: user.id,
      message: message,
      context: contextString,
      docs: docs || [], // Pass along any documents, or an empty array
    };

    // 3. CALL AI SERVICE: Make the API call to the llm-svc.
    const response = await axios.post(llmSvcUrl, payload);
    const reply = response.data.reply;

    // 4. SEND RESPONSE: Forward the AI's reply back to the frontend client.
    res.status(200).json({ success: true, reply: reply });

  } catch (error) {
    // Robust error logging for debugging
    console.error('--- DETAILED ERROR in handleChat ---');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that is not in the 2xx range
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request Error:', error.request);
    } else {
      // Something else happened in setting up the request
      console.error('Error Message:', error.message);
    }
    res.status(500).json({ success: false, message: 'Failed to get chat response' });
  }
};
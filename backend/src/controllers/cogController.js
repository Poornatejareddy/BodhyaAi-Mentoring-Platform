const Student = require('../models/Student');
const cogService = require('../services/cogService');

/**
 * @desc    Submit BFI-44 personality survey
 * @route   POST /api/personality/submit
 * @access  Private (Students only)
 */
exports.submitPersonalitySurvey = async (req, res) => {
    try {
        const userId = req.user._id;
        const surveyResponses = req.body;

        // Validate that all 50 questions are answered
        const requiredQuestions = 50;
        const answeredQuestions = Object.keys(surveyResponses).filter((key) =>
            key.startsWith('Q')
        ).length;

        if (answeredQuestions !== requiredQuestions) {
            return res.status(400).json({
                success: false,
                message: `Incomplete survey: ${answeredQuestions}/${requiredQuestions} questions answered`,
            });
        }

        // Validate response values (should be 1-5)
        for (let i = 1; i <= 50; i++) {
            const value = surveyResponses[`Q${i}`];
            if (!value || value < 1 || value > 5) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid response for Q${i}. Must be between 1 and 5.`,
                });
            }
        }

        // Find student profile
        const student = await Student.findOne({ user: userId });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found',
            });
        }

        // Get personality predictions from cog-svc
        const personalityResult = await cogService.predictPersonality(surveyResponses);

        if (!personalityResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Personality prediction failed',
                error: personalityResult.note || 'Service unavailable',
            });
        }

        // Save survey responses and personality profile
        student.surveyResponses = new Map();
        for (let i = 1; i <= 50; i++) {
            student.surveyResponses.set(`Q${i}`, surveyResponses[`Q${i}`]);
        }

        student.personalityProfile = {
            predictions: personalityResult.predictions,
            insights: personalityResult.insights,
            lastCalculated: new Date(),
        };

        await student.save();

        // Get detailed interpretation for response
        const detailedInterpretation = cogService.getDetailedInterpretation(
            personalityResult.predictions
        );

        res.status(200).json({
            success: true,
            message: 'Personality survey submitted successfully',
            data: {
                oceanScores: personalityResult.predictions,
                insights: personalityResult.insights,
                interpretation: detailedInterpretation,
                timestamp: personalityResult.timestamp,
            },
        });
    } catch (error) {
        console.error('Error submitting personality survey:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during survey submission',
            error: error.message,
        });
    }
};

/**
 * @desc    Get own personality profile
 * @route   GET /api/personality/profile
 * @access  Private (Students)
 */
exports.getOwnPersonalityProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const student = await Student.findOne({ user: userId })
            .populate('user', 'name email');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found',
            });
        }

        if (!student.personalityProfile || !student.personalityProfile.predictions) {
            return res.status(404).json({
                success: false,
                message: 'Personality assessment not yet completed',
                hint: 'Please complete the BFI-44 survey',
            });
        }

        const detailedInterpretation = cogService.getDetailedInterpretation(
            student.personalityProfile.predictions
        );

        res.status(200).json({
            success: true,
            data: {
                studentName: student.name,
                oceanScores: student.personalityProfile.predictions,
                insights: student.personalityProfile.insights,
                interpretation: detailedInterpretation,
                lastCalculated: student.personalityProfile.lastCalculated,
            },
        });
    } catch (error) {
        console.error('Error fetching personality profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get student personality profile (for mentors)
 * @route   GET /api/personality/profile/:studentId
 * @access  Private (Mentors only)
 */
exports.getStudentPersonalityProfile = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId)
            .populate('user', 'name email');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        // Check consent
        if (!student.consent.sharePersonality) {
            return res.status(403).json({
                success: false,
                message: 'Student has not consented to personality data sharing',
            });
        }

        if (!student.personalityProfile || !student.personalityProfile.predictions) {
            return res.status(404).json({
                success: false,
                message: 'Personality assessment not available for this student',
            });
        }

        const detailedInterpretation = cogService.getDetailedInterpretation(
            student.personalityProfile.predictions
        );

        res.status(200).json({
            success: true,
            data: {
                studentId,
                studentName: student.name,
                usn: student.usn,
                department: student.department,
                oceanScores: student.personalityProfile.predictions,
                insights: student.personalityProfile.insights,
                interpretation: detailedInterpretation,
                lastCalculated: student.personalityProfile.lastCalculated,
            },
        });
    } catch (error) {
        console.error('Error fetching student personality profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get personality insights for use in risk analysis
 * @route   GET /api/personality/insights/:studentId
 * @access  Private (System/Internal use)
 */
exports.getPersonalityInsights = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        if (!student.personalityProfile || !student.personalityProfile.predictions) {
            return res.status(404).json({
                success: false,
                message: 'Personality data not available',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                oceanScores: student.personalityProfile.predictions,
                insights: student.personalityProfile.insights,
            },
        });
    } catch (error) {
        console.error('Error fetching personality insights:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = exports;

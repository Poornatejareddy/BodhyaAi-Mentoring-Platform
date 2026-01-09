const Student = require('../models/Student');
const SurveyLink = require('../models/SurveyLink');
const Mentor = require('../models/Mentor');
const cogService = require('../services/cogService');
const pdfService = require('../services/pdfService');
const nodemailer = require('nodemailer');

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

/**
 * @desc    Generate survey link for a student
 * @route   POST /api/personality/generate-link/:studentId
 * @access  Private (Mentors only)
 */
exports.generateSurveyLink = async (req, res) => {
    try {
        const mentorUserId = req.user._id;
        const { studentId } = req.params;

        // Find mentor profile
        const mentor = await Mentor.findOne({ user: mentorUserId });
        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor profile not found',
            });
        }

        // Find student
        const student = await Student.findById(studentId).populate('user', 'name email');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        // Check if student is assigned to this mentor
        if (student.mentor && student.mentor.toString() !== mentor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'This student is not assigned to you',
            });
        }

        // Check if there's already an active (unused) link for this student
        const existingLink = await SurveyLink.findOne({
            mentor: mentor._id,
            student: studentId,
            isUsed: false,
        });

        if (existingLink) {
            const validation = existingLink.isValid();
            if (validation.valid) {
                // Return existing valid link
                const surveyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/survey/${existingLink.token}`;
                return res.status(200).json({
                    success: true,
                    message: 'Active survey link already exists',
                    data: {
                        linkId: existingLink._id,
                        token: existingLink.token,
                        surveyUrl,
                        studentName: student.name,
                        createdAt: existingLink.createdAt,
                        expiresAt: existingLink.expiresAt,
                    },
                });
            }
        }

        // Create new survey link
        const surveyLink = new SurveyLink({
            mentor: mentor._id,
            student: studentId,
            // Set expiration to 90 days from now (configurable)
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        });

        await surveyLink.save();

        const surveyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/survey/${surveyLink.token}`;

        res.status(201).json({
            success: true,
            message: 'Survey link generated successfully',
            data: {
                linkId: surveyLink._id,
                token: surveyLink.token,
                surveyUrl,
                studentName: student.name,
                studentEmail: student.user.email,
                createdAt: surveyLink.createdAt,
                expiresAt: surveyLink.expiresAt,
            },
        });
    } catch (error) {
        console.error('Error generating survey link:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get survey link information (validate token)
 * @route   GET /api/personality/link/:token
 * @access  Public
 */
exports.getSurveyLinkInfo = async (req, res) => {
    try {
        const { token } = req.params;

        const surveyLink = await SurveyLink.findOne({ token })
            .populate('student', 'name usn department')
            .populate({
                path: 'mentor',
                populate: { path: 'user', select: 'name' },
            });

        if (!surveyLink) {
            return res.status(404).json({
                success: false,
                message: 'Invalid survey link',
            });
        }

        // Validate link
        const validation = surveyLink.isValid();
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.reason,
            });
        }

        res.status(200).json({
            success: true,
            data: {
                studentName: surveyLink.student.name,
                usn: surveyLink.student.usn,
                department: surveyLink.student.department,
                mentorName: surveyLink.mentor.user.name,
                createdAt: surveyLink.createdAt,
                expiresAt: surveyLink.expiresAt,
            },
        });
    } catch (error) {
        console.error('Error fetching survey link info:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Submit survey via public link
 * @route   POST /api/personality/link/:token/submit
 * @access  Public
 */
exports.submitSurveyViaLink = async (req, res) => {
    try {
        const { token } = req.params;
        const surveyResponses = req.body;

        // Find survey link
        const surveyLink = await SurveyLink.findOne({ token }).populate('student');

        if (!surveyLink) {
            return res.status(404).json({
                success: false,
                message: 'Invalid survey link',
            });
        }

        // Validate link
        const validation = surveyLink.isValid();
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.reason,
            });
        }

        // Validate survey responses
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

        // Get personality predictions from cog-svc
        const personalityResult = await cogService.predictPersonality(surveyResponses);

        if (!personalityResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Personality prediction failed',
                error: personalityResult.note || 'Service unavailable',
            });
        }

        // Save survey responses and personality profile to student
        const student = surveyLink.student;
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

        // Mark survey link as used
        await surveyLink.markAsUsed({
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        // Emit Socket.io notification to mentor (if available)
        try {
            const io = req.app.get('io');
            if (io && surveyLink.mentor) {
                io.to(`mentor_${surveyLink.mentor.toString()}`).emit('survey:completed', {
                    studentId: student._id,
                    studentName: student.name,
                    mentorId: surveyLink.mentor,
                    completedAt: new Date(),
                });
                console.log(`Survey completion notification sent to mentor ${surveyLink.mentor}`);
            }
        } catch (socketError) {
            console.error('Error sending Socket.io notification:', socketError);
            // Don't fail the request if notification fails
        }

        // Get detailed interpretation for response
        const detailedInterpretation = cogService.getDetailedInterpretation(
            personalityResult.predictions
        );

        res.status(200).json({
            success: true,
            message: 'Survey submitted successfully! Your mentor will be able to view your results.',
            data: {
                oceanScores: personalityResult.predictions,
                insights: personalityResult.insights,
                interpretation: detailedInterpretation,
                timestamp: personalityResult.timestamp,
            },
        });
    } catch (error) {
        console.error('Error submitting survey via link:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during survey submission',
            error: error.message,
        });
    }
};

/**
 * @desc    Get personality results for all students under a mentor
 * @route   GET /api/personality/my-students-results
 * @access  Private (Mentors only)
 */
exports.getMentorStudentResults = async (req, res) => {
    try {
        const mentorUserId = req.user._id;

        // Find mentor profile
        const mentor = await Mentor.findOne({ user: mentorUserId });
        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor profile not found',
            });
        }

        // Find all students assigned to this mentor
        const students = await Student.find({ mentor: mentor._id })
            .populate('user', 'name email')
            .select('name usn department personalityProfile consent');

        // Get all survey links created by this mentor
        const surveyLinks = await SurveyLink.find({ mentor: mentor._id })
            .populate('student', 'name usn');

        // Build response data
        const studentsData = students.map((student) => {
            const studentLink = surveyLinks.find(
                (link) => link.student._id.toString() === student._id.toString()
            );

            let linkStatus = 'no_link';
            let surveyUrl = null;
            let linkCreatedAt = null;

            if (studentLink) {
                if (studentLink.isUsed) {
                    linkStatus = 'completed';
                } else {
                    const validation = studentLink.isValid();
                    if (validation.valid) {
                        linkStatus = 'pending';
                        surveyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/survey/${studentLink.token}`;
                    } else {
                        linkStatus = 'expired';
                    }
                }
                linkCreatedAt = studentLink.createdAt;
            }

            // Check if student has personality profile and consent
            let personalityData = null;
            if (
                student.personalityProfile &&
                student.personalityProfile.predictions &&
                student.consent.sharePersonality
            ) {
                personalityData = {
                    oceanScores: student.personalityProfile.predictions,
                    insights: student.personalityProfile.insights,
                    lastCalculated: student.personalityProfile.lastCalculated,
                    interpretation: cogService.getDetailedInterpretation(
                        student.personalityProfile.predictions
                    ),
                };
            }

            return {
                studentId: student._id,
                name: student.name,
                usn: student.usn,
                department: student.department,
                email: student.user?.email,
                linkStatus,
                surveyUrl,
                linkCreatedAt,
                hasPersonalityData: !!personalityData,
                personalityData,
            };
        });

        res.status(200).json({
            success: true,
            data: {
                totalStudents: studentsData.length,
                students: studentsData,
            },
        });
    } catch (error) {
        console.error('Error fetching mentor student results:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * Helper function to create email transporter
 */
const createEmailTransporter = () => {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email not configured. Set EMAIL_USER and EMAIL_PASS in .env');
        return null;
    }

    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

/**
 * @desc    Download personality report as PDF
 * @route   GET /api/personality/profile/:studentId/pdf
 * @access  Private (Mentors only)
 */
exports.downloadPersonalityPDF = async (req, res) => {
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

        // Generate PDF
        const doc = pdfService.generatePersonalityReport(student);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${student.name.replace(/\s+/g, '_')}_Personality_Report.pdf"`
        );

        // Pipe PDF to response
        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating PDF',
            error: error.message,
        });
    }
};

/**
 * @desc    Generate survey link with optional email sending
 * @route   POST /api/personality/generate-link/:studentId?sendEmail=true
 * @access  Private (Mentors only)
 */
exports.generateSurveyLinkWithEmail = async (req, res) => {
    try {
        const mentorUserId = req.user._id;
        const { studentId } = req.params;
        const { sendEmail } = req.query;

        // Find mentor profile
        const mentor = await Mentor.findOne({ user: mentorUserId }).populate('user', 'name email');
        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor profile not found',
            });
        }

        // Find student
        const student = await Student.findById(studentId).populate('user', 'name email');
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        // Check if student is assigned to this mentor
        if (student.mentor && student.mentor.toString() !== mentor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'This student is not assigned to you',
            });
        }

        // Check if there's already an active (unused) link for this student
        let surveyLink = await SurveyLink.findOne({
            mentor: mentor._id,
            student: studentId,
            isUsed: false,
        });

        let isNewLink = false;
        if (surveyLink) {
            const validation = surveyLink.isValid();
            if (!validation.valid) {
                // If expired, create a new one
                isNewLink = true;
                surveyLink = new SurveyLink({
                    mentor: mentor._id,
                    student: studentId,
                    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                });
                await surveyLink.save();
            }
        } else {
            // Create new survey link
            isNewLink = true;
            surveyLink = new SurveyLink({
                mentor: mentor._id,
                student: studentId,
                expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            });
            await surveyLink.save();
        }

        const surveyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/survey/${surveyLink.token}`;

        // Send email if requested and configured
        let emailSent = false;
        let emailError = null;

        if (sendEmail === 'true' && student.user.email) {
            const transporter = createEmailTransporter();

            if (transporter) {
                try {
                    const mailOptions = {
                        from: `"${mentor.user.name} - BodhyaAI" <${process.env.EMAIL_USER}>`,
                        to: student.user.email,
                        subject: 'Complete Your Personality Assessment',
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                                    <h1 style="margin: 0;">Personality Assessment Invitation</h1>
                                </div>
                                
                                <div style="padding: 30px; background-color: #f9fafb;">
                                    <p style="font-size: 16px; color: #374151;">Dear ${student.name},</p>
                                    
                                    <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                                        Your mentor, <strong>${mentor.user.name}</strong>, has invited you to complete a personality assessment 
                                        to better understand your learning style and strengths.
                                    </p>
                                    
                                    <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                                        The BFI-44 personality survey takes approximately 10-15 minutes to complete and will provide valuable 
                                        insights about your personality traits (OCEAN model).
                                    </p>
                                    
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="${surveyUrl}" 
                                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                                  color: white; padding: 15px 40px; text-decoration: none; 
                                                  border-radius: 8px; font-weight: bold; display: inline-block;">
                                            Start Survey
                                        </a>
                                    </div>
                                    
                                    <p style="font-size: 12px; color: #9ca3af; line-height: 1.6;">
                                        Or copy and paste this link into your browser:<br>
                                        <a href="${surveyUrl}" style="color: #667eea;">${surveyUrl}</a>
                                    </p>
                                    
                                    <p style="font-size: 12px; color: #9ca3af;">
                                        This link will expire on ${new Date(surveyLink.expiresAt).toLocaleDateString()}.
                                    </p>
                                </div>
                                
                                <div style="padding: 20px; background-color: #e5e7eb; text-align: center;">
                                    <p style="font-size: 12px; color: #6b7280; margin: 0;">
                                        BodhyaAI - Personalized Student Mentoring Platform
                                    </p>
                                </div>
                            </div>
                        `,
                    };

                    await transporter.sendMail(mailOptions);
                    emailSent = true;
                } catch (emailErr) {
                    console.error('Error sending email:', emailErr);
                    emailError = emailErr.message;
                }
            } else {
                emailError = 'Email service not configured';
            }
        }

        res.status(isNewLink ? 201 : 200).json({
            success: true,
            message: isNewLink ? 'Survey link generated successfully' : 'Active survey link already exists',
            data: {
                linkId: surveyLink._id,
                token: surveyLink.token,
                surveyUrl,
                studentName: student.name,
                studentEmail: student.user.email,
                createdAt: surveyLink.createdAt,
                expiresAt: surveyLink.expiresAt,
                emailSent,
                emailError,
            },
        });
    } catch (error) {
        console.error('Error generating survey link:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Generate survey links for multiple students (bulk operation)
 * @route   POST /api/personality/generate-links-bulk
 * @access  Private (Mentors only)
 */
exports.generateBulkSurveyLinks = async (req, res) => {
    try {
        const mentorUserId = req.user._id;
        const { studentIds, sendEmail } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'studentIds array is required',
            });
        }

        // Find mentor profile
        const mentor = await Mentor.findOne({ user: mentorUserId }).populate('user', 'name email');
        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor profile not found',
            });
        }

        const results = [];
        const transporter = sendEmail ? createEmailTransporter() : null;

        for (const studentId of studentIds) {
            try {
                // Find student
                const student = await Student.findById(studentId).populate('user', 'name email');

                if (!student) {
                    results.push({
                        studentId,
                        success: false,
                        error: 'Student not found',
                    });
                    continue;
                }

                // Check if student is assigned to this mentor
                if (student.mentor && student.mentor.toString() !== mentor._id.toString()) {
                    results.push({
                        studentId,
                        studentName: student.name,
                        success: false,
                        error: 'Student not assigned to you',
                    });
                    continue;
                }

                // Check for existing active link
                let surveyLink = await SurveyLink.findOne({
                    mentor: mentor._id,
                    student: studentId,
                    isUsed: false,
                });

                let isNewLink = false;
                if (surveyLink) {
                    const validation = surveyLink.isValid();
                    if (!validation.valid) {
                        isNewLink = true;
                        surveyLink = new SurveyLink({
                            mentor: mentor._id,
                            student: studentId,
                            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                        });
                        await surveyLink.save();
                    }
                } else {
                    isNewLink = true;
                    surveyLink = new SurveyLink({
                        mentor: mentor._id,
                        student: studentId,
                        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                    });
                    await surveyLink.save();
                }

                const surveyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/survey/${surveyLink.token}`;

                // Send email if requested
                let emailSent = false;
                if (sendEmail && transporter && student.user.email) {
                    try {
                        const mailOptions = {
                            from: `"${mentor.user.name} - BodhyaAI" <${process.env.EMAIL_USER}>`,
                            to: student.user.email,
                            subject: 'Complete Your Personality Assessment',
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                                        <h1 style="margin: 0;">Personality Assessment Invitation</h1>
                                    </div>
                                    <div style="padding: 30px; background-color: #f9fafb;">
                                        <p style="font-size: 16px; color: #374151;">Dear ${student.name},</p>
                                        <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                                            Your mentor, <strong>${mentor.user.name}</strong>, has invited you to complete a personality assessment.
                                        </p>
                                        <div style="text-align: center; margin: 30px 0;">
                                            <a href="${surveyUrl}" 
                                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                                      color: white; padding: 15px 40px; text-decoration: none; 
                                                      border-radius: 8px; font-weight: bold; display: inline-block;">
                                                Start Survey
                                            </a>
                                        </div>
                                        <p style="font-size: 12px; color: #9ca3af;">
                                            This link will expire on ${new Date(surveyLink.expiresAt).toLocaleDateString()}.
                                        </p>
                                    </div>
                                </div>
                            `,
                        };

                        await transporter.sendMail(mailOptions);
                        emailSent = true;
                    } catch (emailErr) {
                        console.error(`Error sending email to ${student.name}:`, emailErr);
                    }
                }

                results.push({
                    studentId,
                    studentName: student.name,
                    success: true,
                    surveyUrl,
                    isNewLink,
                    emailSent,
                });
            } catch (error) {
                console.error(`Error processing student ${studentId}:`, error);
                results.push({
                    studentId,
                    success: false,
                    error: error.message,
                });
            }
        }

        const successCount = results.filter(r => r.success).length;

        res.status(200).json({
            success: true,
            message: `Generated links for ${successCount}/${studentIds.length} students`,
            data: {
                totalRequested: studentIds.length,
                successful: successCount,
                failed: studentIds.length - successCount,
                results,
            },
        });
    } catch (error) {
        console.error('Error generating bulk survey links:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = exports;



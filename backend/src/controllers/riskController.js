const Student = require('../models/Student');
const AuditLog = require('../models/AuditLog');
const riskService = require('../services/riskService');
const xaiService = require('../services/xaiService');

/**
 * @desc    Calculate risk prediction for a student
 * @route   POST /api/risk/predict/:studentId
 * @access  Private (Mentors only)
 */
exports.predictStudentRisk = async (req, res) => {
    try {
        const { studentId } = req.params;
        const mentorId = req.user._id;

        // Find student
        const student = await Student.findById(studentId)
            .populate('user', 'name email');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        // Check student consent
        if (!student.consent.shareRisk) {
            return res.status(403).json({
                success: false,
                message: 'Student has not consented to risk assessment sharing',
            });
        }

        // Get risk inputs from student data
        const riskInputs = student.riskInputs || {};

        // Call risk service
        const riskPrediction = await riskService.predictRisk(riskInputs);

        if (!riskPrediction.success) {
            return res.status(500).json({
                success: false,
                message: 'Risk prediction failed',
                error: riskPrediction.note || 'Service unavailable',
            });
        }

        // Get XAI explanation
        const explanation = await xaiService.generateFullExplanation(
            riskInputs,
            riskPrediction.prediction
        );

        // Combine results
        const combinedResult = {
            prediction: riskPrediction.prediction,
            confidence: riskPrediction.confidence,
            model: riskPrediction.model,
            warnings: explanation.warnings || [],
            insights: explanation.insights || [],
            recommendations: explanation.recommendations || [],
            calculatedAt: new Date(),
            calculatedBy: mentorId,
        };

        // Save to student record
        student.academicRisk = combinedResult;
        await student.save();

        // Log mentor access in audit trail
        await AuditLog.create({
            user: mentorId,
            action: 'risk_assessment',
            targetModel: 'Student',
            targetId: studentId,
            details: {
                prediction: riskPrediction.prediction,
                confidence: riskPrediction.confidence,
                model: riskPrediction.model,
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        res.status(200).json({
            success: true,
            data: {
                studentId,
                studentName: student.name,
                usn: student.usn,
                department: student.department,
                risk: combinedResult,
            },
        });
    } catch (error) {
        console.error('Error predicting student risk:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during risk prediction',
            error: error.message,
        });
    }
};

/**
 * @desc    Get existing risk data for a student
 * @route   GET /api/risk/student/:studentId
 * @access  Private (Mentors and Student themselves)
 */
exports.getStudentRisk = async (req, res) => {
    try {
        const { studentId } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        const student = await Student.findById(studentId)
            .populate('user', 'name email');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found',
            });
        }

        // Check authorization
        const isOwnProfile = student.user._id.toString() === userId.toString();
        const isMentor = userRole === 'mentor';

        if (!isOwnProfile && !isMentor) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access',
            });
        }

        // Check consent for mentors
        if (isMentor && !student.consent.shareRisk) {
            return res.status(403).json({
                success: false,
                message: 'Student has not consented to risk data sharing',
            });
        }

        // Check if risk has been calculated
        if (!student.academicRisk || !student.academicRisk.prediction) {
            return res.status(404).json({
                success: false,
                message: 'Risk assessment not yet performed',
            });
        }

        res.status(200).json({
            success: true,
            data: {
                studentId,
                studentName: student.name,
                usn: student.usn,
                risk: student.academicRisk,
            },
        });
    } catch (error) {
        console.error('Error fetching student risk:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Batch predict risk for multiple students
 * @route   POST /api/risk/batch
 * @access  Private (Mentors only)
 */
exports.batchPredictRisk = async (req, res) => {
    try {
        const { studentIds } = req.body;
        const mentorId = req.user._id;

        if (!studentIds || !Array.isArray(studentIds)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student IDs array',
            });
        }

        // Find students
        const students = await Student.find({
            _id: { $in: studentIds },
            'consent.shareRisk': true,
        });

        // Process each student
        const results = [];
        for (const student of students) {
            try {
                const riskPrediction = await riskService.predictRisk(student.riskInputs || {});
                const explanation = await xaiService.generateFullExplanation(
                    student.riskInputs || {},
                    riskPrediction.prediction
                );

                const combinedResult = {
                    prediction: riskPrediction.prediction,
                    confidence: riskPrediction.confidence,
                    model: riskPrediction.model,
                    warnings: explanation.warnings || [],
                    insights: explanation.insights || [],
                    recommendations: explanation.recommendations || [],
                    calculatedAt: new Date(),
                    calculatedBy: mentorId,
                };

                student.academicRisk = combinedResult;
                await student.save();

                results.push({
                    studentId: student._id,
                    studentName: student.name,
                    usn: student.usn,
                    success: true,
                    risk: combinedResult,
                });
            } catch (error) {
                results.push({
                    studentId: student._id,
                    studentName: student.name,
                    success: false,
                    error: error.message,
                });
            }
        }

        // Log batch operation
        await AuditLog.create({
            user: mentorId,
            action: 'batch_risk_assessment',
            targetModel: 'Student',
            details: {
                studentCount: results.length,
                successCount: results.filter((r) => r.success).length,
            },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        res.status(200).json({
            success: true,
            data: results,
        });
    } catch (error) {
        console.error('Error in batch risk prediction:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

/**
 * @desc    Get risk statistics for dashboard
 * @route   GET /api/risk/stats
 * @access  Private (Mentors only)
 */
exports.getRiskStats = async (req, res) => {
    try {
        const mentorId = req.user._id;

        // Get all students for this mentor
        const students = await Student.find({
            mentor: mentorId,
            'consent.shareRisk': true,
            'academicRisk.prediction': { $exists: true },
        });

        const stats = {
            total: students.length,
            high: 0,
            medium: 0,
            low: 0,
            notAssessed: 0,
        };

        students.forEach((student) => {
            if (student.academicRisk && student.academicRisk.prediction) {
                const risk = student.academicRisk.prediction.toUpperCase();
                if (risk === 'HIGH') stats.high++;
                else if (risk === 'MEDIUM') stats.medium++;
                else if (risk === 'LOW') stats.low++;
            } else {
                stats.notAssessed++;
            }
        });

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Error getting risk stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};

module.exports = exports;

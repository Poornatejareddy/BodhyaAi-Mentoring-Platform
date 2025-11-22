const Student = require('../models/Student');
const xaiService = require('../services/xaiService');

/**
 * @desc    Get risk explanation for student
 * @route   GET /api/students/my-profile/risk-explanation
 * @access  Private (Students only)
 */
exports.getRiskExplanation = async (req, res) => {
    try {
        // Find student profile
        const student = await Student.findOne({ user: req.user._id })
            .populate('user', 'name email')
            .lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student profile not found',
            });
        }

        // Check if risk has been calculated
        if (!student.academicRisk || !student.academicRisk.prediction) {
            return res.status(404).json({
                success: false,
                message: 'Risk assessment not available. Please contact your mentor.',
            });
        }

        // Get XAI explanation
        const explanation = await xaiService.getExplanation(
            student._id,
            student.riskInputs || {},
            student.academicRisk.prediction
        );

        // Get top risk factors
        const topFactors = await xaiService.getTopRiskFactors(
            student._id,
            student.riskInputs || {},
            5
        );

        res.status(200).json({
            success: true,
            data: {
                studentId: student._id,
                studentName: student.user.name,
                currentRisk: student.academicRisk.prediction,
                confidence: student.academicRisk.confidence,
                calculatedAt: student.academicRisk.calculatedAt,
                model: student.academicRisk.model,
                shapValues: explanation.shapValues,
                insights: explanation.insights,
                recommendations: explanation.recommendations,
                topFactors,
            },
        });
    } catch (error) {
        console.error('Error getting risk explanation:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching risk explanation',
            error: error.message,
        });
    }
};

module.exports = exports;

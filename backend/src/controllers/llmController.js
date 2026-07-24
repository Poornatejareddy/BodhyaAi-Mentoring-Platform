/**
 * LLM Controller
 * Handles requests for study plans, interventions, and reports
 */

const llmService = require('../services/llmService');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');

/**
 * @desc    Generate a personalized study plan
 * @route   POST /api/llm/study-plan
 * @access  Private (Student)
 */
exports.getStudyPlan = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { currentCgpa, weakSubjects, targetCgpa, weeks, studyHours } = req.body;

        // Fetch student academic data
        const student = await Student.findOne({ user: studentId });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        const requestedCgpa = Number(currentCgpa);
        const requestedSubjects = Array.isArray(weakSubjects)
            ? weakSubjects.map((subject) => String(subject).trim()).filter(Boolean)
            : [];

        const academicData = {
            cgpa: Number.isFinite(requestedCgpa) && requestedCgpa >= 0
                ? requestedCgpa
                : student.riskInputs?.CGPA || 0,
            weakSubjects: requestedSubjects.length > 0
                ? requestedSubjects
                : student.academicHistory?.weakSubjects || [],
            studyHours: studyHours || student.riskInputs?.StudyHoursPerDay * 7 || 14,
            targetCgpa: targetCgpa || (student.riskInputs?.CGPA ? student.riskInputs.CGPA + 0.5 : 7.0),
            weeks: weeks || 4
        };

        const plan = await llmService.generateStudyPlan(studentId, academicData);

        res.status(200).json({
            success: true,
            data: plan
        });
    } catch (error) {
        console.error('Error generating study plan:', error);
        res.status(500).json({ success: false, message: 'Failed to generate study plan' });
    }
};

/**
 * @desc    Get intervention recommendations for a student
 * @route   POST /api/llm/interventions/:studentId
 * @access  Private (Mentor)
 */
exports.getInterventions = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Verify mentor access
        const mentor = await Mentor.findOne({ user: req.user._id });
        // In a real app, check if studentId is in mentor's mentees list

        const student = await Student.findOne({ user: studentId });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const riskLevel = student.academicRisk?.prediction || 'MEDIUM';
        const academicData = {
            cgpa: student.riskInputs?.CGPA,
            attendance: student.riskInputs?.Attendance,
            backlogs: student.riskInputs?.Backlogs,
            stress: student.riskInputs?.StressScore
        };

        const interventions = await llmService.recommendInterventions(studentId, riskLevel, academicData);

        res.status(200).json({
            success: true,
            data: interventions
        });
    } catch (error) {
        console.error('Error getting interventions:', error);
        res.status(500).json({ success: false, message: 'Failed to get interventions' });
    }
};

/**
 * @desc    Generate class performance report
 * @route   POST /api/llm/class-report
 * @access  Private (Mentor)
 */
exports.getClassReport = async (req, res) => {
    try {
        const { focusArea } = req.body;
        const mentor = await Mentor.findOne({ user: req.user._id }).populate('mentees');

        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor profile not found' });
        }

        if (!mentor.mentees || mentor.mentees.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No mentees assigned. Please assign students before generating a report.' 
            });
        }

        // Prepare anonymized class data
        const classData = mentor.mentees.map(m => ({
            risk: m.academicRisk?.prediction,
            cgpa: m.riskInputs?.CGPA,
            attendance: m.riskInputs?.Attendance,
            backlogs: m.riskInputs?.Backlogs
        }));

        const report = await llmService.generateClassReport(req.user._id, classData, focusArea);

        // Check if the LLM microservice returned an error
        if (report && report.success === false) {
            return res.status(503).json({ 
                success: false, 
                message: report.error || 'AI service is temporarily unavailable. Please try again later.' 
            });
        }

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error generating class report:', error);
        res.status(500).json({ success: false, message: 'Failed to generate report. The AI service may be temporarily unavailable.' });
    }
};

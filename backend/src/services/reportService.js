const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const Intervention = require('../models/Intervention');

// @desc    Generate student report data
// @route   GET /api/mentors/report/pdf/:studentId
// @access  Private (Mentor)
exports.generateStudentPDFReport = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Fetch student data
        const student = await Student.findById(studentId)
            .populate('user', 'name email')
            .populate({
                path: 'mentor',
                populate: { path: 'user', select: 'name' }
            });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Fetch interventions
        const interventions = await Intervention.find({ student: studentId }).sort({ createdAt: -1 });

        // Create simple text report (in production, use a PDF library like pdfkit)
        const report = `
STUDENT REPORT
Generated: ${new Date().toLocaleString()}
=====================================

STUDENT INFORMATION:
Name: ${student.user?.name || 'N/A'}
USN: ${student.usn || 'N/A'}
Department: ${student.department || 'N/A'}
Section: ${student.section || 'N/A'}
Email: ${student.user?.email || 'N/A'}

ACADEMIC PERFORMANCE:
CGPA: ${student.riskInputs?.CGPA || 'N/A'}
Attendance: ${student.riskInputs?.Attendance || 'N/A'}%
Backlogs: ${student.riskInputs?.Backlogs || 0}
Study Hours/Day: ${student.riskInputs?.StudyHoursPerDay || 'N/A'}

RISK ASSESSMENT:
Prediction: ${student.academicRisk?.prediction || 'Not Assessed'}
Confidence: ${student.academicRisk?.confidence ? (student.academicRisk.confidence * 100).toFixed(1) + '%' : 'N/A'}
Calculated: ${student.academicRisk?.calculatedAt ? new Date(student.academicRisk.calculatedAt).toLocaleString() : 'Never'}

INTERVENTIONS (${interventions.length}):
${interventions.map((i, idx) => `
${idx + 1}. ${i.title}
   Type: ${i.type}
   Status: ${i.status}
   Priority: ${i.priority}
   Created: ${new Date(i.createdAt).toLocaleDateString()}
   ${i.description}
`).join('\n')}

MENTOR:
${student.mentor?.user?.name || 'Not Assigned'}
=====================================
    `.trim();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=student_${studentId}_report.pdf`);
        res.send(report); // In production, send actual PDF
    } catch (error) {
        console.error('PDF report error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Generate student CSV export
// @route   GET /api/mentors/report/csv/:studentId
// @access  Private (Mentor)
exports.generateStudentCSVExport = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId).populate('user');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Create CSV
        const csv = `Name,USN,Department,Section,CGPA,Attendance,Backlogs,Risk
${student.user?.name || 'N/A'},${student.usn || 'N/A'},${student.department || 'N/A'},${student.section || 'N/A'},${student.riskInputs?.CGPA || 'N/A'},${student.riskInputs?.Attendance || 'N/A'},${student.riskInputs?.Backlogs || 0},${student.academicRisk?.prediction || 'N/A'}`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=student_${studentId}_data.csv`);
        res.send(csv);
    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

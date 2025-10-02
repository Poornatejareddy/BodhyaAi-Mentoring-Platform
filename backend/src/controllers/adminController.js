const Mentor = require('../models/Mentor');
const Student = require('../models/Student');

// @desc    Assign a student to a mentor
// @route   POST /api/admin/assign-mentee
// @access  Private (Admin only)
exports.assignMentee = async (req, res) => {
    const { mentorUserId, studentUserId } = req.body;
    try {
        const mentor = await Mentor.findOne({ user: mentorUserId });
        const student = await Student.findOne({ user: studentUserId });

        if (!mentor || !student) {
            return res.status(404).json({ message: 'Mentor or Student not found' });
        }
        
        // Add student to mentor's list and assign mentor to student
        mentor.mentees.addToSet(student._id);
        student.mentor = mentor._id;

        await mentor.save();
        await student.save();

        res.status(200).json({ success: true, message: 'Mentee assigned successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
const Intervention = require('../models/Intervention');
const Mentor = require('../models/Mentor');
const Student = require('../models/Student');

// @desc    Create new intervention
// @route   POST /api/interventions
// @access  Private (Mentors only)
exports.createIntervention = async (req, res) => {
    try {
        const { studentId, type, title, description, priority, scheduledDate, deadline } = req.body;

        // Verify mentor
        const mentor = await Mentor.findOne({ user: req.user.id });
        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor profile not found' });
        }

        // Verify student is assigned to this mentor
        const student = await Student.findById(studentId);
        if (!student || !student.mentor || student.mentor.toString() !== mentor._id.toString()) {
            return res.status(403).json({ success: false, message: 'Student not assigned to you' });
        }

        const intervention = await Intervention.create({
            student: studentId,
            mentor: mentor._id,
            type,
            title,
            description,
            priority: priority || 'MEDIUM',
            scheduledDate,
            deadline
        });

        await intervention.populate('student mentor');

        res.status(201).json({
            success: true,
            data: intervention
        });
    } catch (error) {
        console.error('Create intervention error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// @desc    Get interventions for a student
// @route   GET /api/interventions/student/:studentId
// @access  Private (Mentor/Student)
exports.getStudentInterventions = async (req, res) => {
    try {
        const { studentId } = req.params;

        const interventions = await Intervention.find({ student: studentId })
            .populate('mentor', 'user')
            .populate({
                path: 'mentor',
                populate: { path: 'user', select: 'name email' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: interventions.length,
            data: interventions
        });
    } catch (error) {
        console.error('Get interventions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all interventions for mentor
// @route   GET /api/interventions/my-interventions
// @access  Private (Mentors)
exports.getMyInterventions = async (req, res) => {
    try {
        const mentor = await Mentor.findOne({ user: req.user.id });
        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor profile not found' });
        }

        const interventions = await Intervention.find({ mentor: mentor._id })
            .populate('student', 'user usn')
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name' }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: interventions.length,
            data: interventions
        });
    } catch (error) {
        console.error('Get my interventions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update intervention
// @route   PUT /api/interventions/:id
// @access  Private (Mentor)
exports.updateIntervention = async (req, res) => {
    try {
        const { status, outcome, followUpRequired } = req.body;

        let intervention = await Intervention.findById(req.params.id);
        if (!intervention) {
            return res.status(404).json({ success: false, message: 'Intervention not found' });
        }

        // Verify mentor owns this intervention
        const mentor = await Mentor.findOne({ user: req.user.id });
        if (intervention.mentor.toString() !== mentor._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Update fields
        if (status) intervention.status = status;
        if (outcome) intervention.outcome = outcome;
        if (followUpRequired !== undefined) intervention.followUpRequired = followUpRequired;

        if (status === 'COMPLETED' && !intervention.completedDate) {
            intervention.completedDate = new Date();
        }

        await intervention.save();

        res.status(200).json({
            success: true,
            data: intervention
        });
    } catch (error) {
        console.error('Update intervention error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add note to intervention
// @route   POST /api/interventions/:id/notes
// @access  Private (Mentor)
exports.addNote = async (req, res) => {
    try {
        const { text } = req.body;

        const intervention = await Intervention.findById(req.params.id);
        if (!intervention) {
            return res.status(404).json({ success: false, message: 'Intervention not found' });
        }

        intervention.notes.push({
            text,
            createdBy: req.user.id,
            createdAt: new Date()
        });

        await intervention.save();

        res.status(200).json({
            success: true,
            data: intervention
        });
    } catch (error) {
        console.error('Add note error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete intervention
// @route   DELETE /api/interventions/:id
// @access  Private (Mentor)
exports.deleteIntervention = async (req, res) => {
    try {
        const intervention = await Intervention.findById(req.params.id);
        if (!intervention) {
            return res.status(404).json({ success: false, message: 'Intervention not found' });
        }

        // Verify mentor owns this intervention
        const mentor = await Mentor.findOne({ user: req.user.id });
        if (intervention.mentor.toString() !== mentor._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await intervention.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Intervention deleted'
        });
    } catch (error) {
        console.error('Delete intervention error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

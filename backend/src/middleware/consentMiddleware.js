const Student = require('../models/Student');
const Mentor = require('../models/Mentor');

/**
 * Consent Filtering Middleware
 * Filters student data based on consent settings
 * Only applies when a mentor is accessing student data
 */

/**
 * Check if the requesting user is the assigned mentor
 */
const isAssignedMentor = async (mentorUserId, studentId) => {
    try {
        const student = await Student.findById(studentId).populate('mentor');
        if (!student || !student.mentor) {
            return false;
        }

        // Check if the mentor's user ID matches
        return student.mentor.user.toString() === mentorUserId.toString();
    } catch (error) {
        console.error('Error checking assigned mentor:', error);
        return false;
    }
};

/**
 * Middleware: Require Assigned Mentor
 * Ensures that only the assigned mentor can access student data
 * Usage: requireAssignedMentor (place after protect middleware)
 */
exports.requireAssignedMentor = async (req, res, next) => {
    try {
        // Admin users bypass this check
        if (req.user.role === 'admin') {
            return next();
        }

        // Only applies to mentors
        if (req.user.role !== 'mentor') {
            return res.status(403).json({
                success: false,
                message: 'This endpoint is only accessible by mentors',
            });
        }

        // Get student ID from params or body
        const studentId = req.params.studentId || req.params.id || req.body.studentId;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required',
            });
        }

        // Check if this mentor is assigned to this student
        const isAssigned = await isAssignedMentor(req.user.id, studentId);

        if (!isAssigned) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned as the mentor for this student',
            });
        }

        // Store student ID in request for audit logging
        req.studentId = studentId;
        next();
    } catch (error) {
        console.error('requireAssignedMentor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message,
        });
    }
};

/**
 * Filter student data based on consent settings
 * @param {Object} student - Student document
 * @param {String} userRole - Role of requesting user
 * @returns {Object} Filtered student data
 */
exports.applyConsentFilter = (student, userRole) => {
    // Admins see everything
    if (userRole === 'admin') {
        return student;
    }

    // Students see their own data
    if (userRole === 'student') {
        return student;
    }

    // For mentors, filter based on consent
    if (userRole === 'mentor') {
        const filteredStudent = student.toObject ? student.toObject() : { ...student };

        // Hide risk data if not consented
        if (!student.consent?.shareRisk) {
            delete filteredStudent.academicRisk;
            delete filteredStudent.riskInputs;
        }

        // Hide personality if not consented
        if (!student.consent?.sharePersonality) {
            delete filteredStudent.personalityProfile;
            delete filteredStudent.surveyResponses;
        }

        // Hide academic history if not consented
        if (!student.consent?.shareAcademicHistory) {
            delete filteredStudent.academicHistory;
        }

        // Always hide consent settings from mentors (student privacy)
        delete filteredStudent.consent;

        return filteredStudent;
    }

    // Default: return student as-is
    return student;
};

/**
 * Middleware: Apply consent filtering to response
 * Usage: applyConsentFilterMiddleware (after data retrieval)
 */
exports.applyConsentFilterMiddleware = (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to filter data
    res.json = function (data) {
        // Only filter if response has student data
        if (data && data.success && data.data) {
            // Handle single student
            if (data.data._id || data.data.user) {
                data.data = exports.applyConsentFilter(data.data, req.user.role);
            }
            // Handle array of students
            else if (Array.isArray(data.data)) {
                data.data = data.data.map(student =>
                    exports.applyConsentFilter(student, req.user.role)
                );
            }
        }

        return originalJson(data);
    };

    next();
};

/**
 * Check if student allows chat with mentor
 */
exports.checkChatConsent = async (studentId, mentorUserId) => {
    try {
        const student = await Student.findById(studentId);

        if (!student) {
            return { allowed: false, reason: 'Student not found' };
        }

        if (!student.consent?.allowChat) {
            return { allowed: false, reason: 'Student has disabled chat' };
        }

        // Verify mentor assignment
        const isAssigned = await isAssignedMentor(mentorUserId, studentId);
        if (!isAssigned) {
            return { allowed: false, reason: 'Not assigned mentor' };
        }

        return { allowed: true };
    } catch (error) {
        console.error('checkChatConsent error:', error);
        return { allowed: false, reason: 'Server error' };
    }
};

const Alert = require('../models/Alert');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const { emitAlertToUser } = require('../socket/socketServer');

/**
 * Alert Rules Engine
 * Automatically detects conditions and creates alerts
 */

/**
 * Helper: Create and emit alert
 */
const createAndEmitAlert = async (alertData) => {
    try {
        const alert = await Alert.create(alertData);

        // Populate student info if present
        if (alert.student) {
            await alert.populate('student', 'name usn department');
        }

        // Emit via Socket.IO
        emitAlertToUser(alert.recipient.toString(), alert);

        console.log(`✅ Alert created: ${alert.type} for user ${alert.recipient}`);
        return alert;
    } catch (error) {
        console.error('Error creating alert:', error);
        throw error;
    }
};

/**
 * Rule 1: High Risk Alert
 * Triggered when student's academic risk is HIGH or at-risk
 */
const checkHighRiskAlert = async (studentId) => {
    try {
        const student = await Student.findById(studentId).populate('mentor');

        if (!student || !student.academicRisk || !student.mentor) {
            return null;
        }

        const riskLevel = student.academicRisk.prediction;

        // Only alert if risk is HIGH or at-risk
        if (riskLevel === 'HIGH' || riskLevel === 'at-risk') {
            // Check if similar alert exists recently (avoid spam)
            const recentAlert = await Alert.findOne({
                student: studentId,
                type: 'HIGH_RISK',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
            });

            if (recentAlert) {
                return null; // Don't create duplicate
            }

            // Create alert for mentor
            const alert = await createAndEmitAlert({
                type: 'HIGH_RISK',
                student: studentId,
                recipient: student.mentor.user,
                recipientRole: 'mentor',
                title: `High Academic Risk: ${student.name}`,
                message: `${student.name} (${student.usn}) has been flagged with ${riskLevel} academic risk. Immediate attention required.`,
                priority: 'HIGH',
                actionLink: `/mentees/${studentId}`,
                metadata: {
                    riskLevel: riskLevel,
                    warnings: student.academicRisk.warnings || [],
                },
            });

            return alert;
        }

        return null;
    } catch (error) {
        console.error('Error checking high risk alert:', error);
        return null;
    }
};

/**
 * Rule 2: Attendance Drop Alert
 * Triggered when attendance drops below threshold or drops significantly
 */
const checkAttendanceDropAlert = async (studentId, oldAttendance, newAttendance) => {
    try {
        const student = await Student.findById(studentId).populate('mentor');

        if (!student || !student.mentor) {
            return null;
        }

        const THRESHOLD = 75; // Minimum attendance threshold
        const DROP_THRESHOLD = 10; // Alert if attendance drops by 10%

        let shouldAlert = false;
        let message = '';
        let priority = 'MEDIUM';

        // Check if attendance dropped below threshold
        if (newAttendance < THRESHOLD && oldAttendance >= THRESHOLD) {
            shouldAlert = true;
            message = `${student.name}'s attendance has dropped below ${THRESHOLD}% (now at ${newAttendance}%).`;
            priority = 'HIGH';
        }
        // Check for significant drop
        else if (oldAttendance && (oldAttendance - newAttendance) >= DROP_THRESHOLD) {
            shouldAlert = true;
            message = `${student.name}'s attendance has dropped by ${(oldAttendance - newAttendance).toFixed(1)}% (from ${oldAttendance}% to ${newAttendance}%).`;
            priority = 'MEDIUM';
        }

        if (shouldAlert) {
            // Check for recent similar alert
            const recentAlert = await Alert.findOne({
                student: studentId,
                type: 'ATTENDANCE_DROP',
                createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }, // Last 48 hours
            });

            if (recentAlert) {
                return null;
            }

            const alert = await createAndEmitAlert({
                type: 'ATTENDANCE_DROP',
                student: studentId,
                recipient: student.mentor.user,
                recipientRole: 'mentor',
                title: 'Attendance Alert',
                message: message,
                priority: priority,
                actionLink: `/mentees/${studentId}`,
                metadata: {
                    oldAttendance: oldAttendance,
                    newAttendance: newAttendance,
                    threshold: THRESHOLD,
                },
            });

            return alert;
        }

        return null;
    } catch (error) {
        console.error('Error checking attendance drop alert:', error);
        return null;
    }
};

/**
 * Rule 3: Mentor Inactivity Alert
 * Triggered when mentor hasn't viewed/updated student in 48+ hours
 */
const checkMentorInactivityAlert = async (mentorId) => {
    try {
        const AuditLog = require('../models/AuditLog');
        const mentor = await Mentor.findById(mentorId).populate('user').populate('mentees');

        if (!mentor || !mentor.mentees || mentor.mentees.length === 0) {
            return null;
        }

        const INACTIVITY_THRESHOLD = 48 * 60 * 60 * 1000; // 48 hours

        // Check last activity for each mentee
        for (const student of mentor.mentees) {
            // Find most recent audit log for this mentor accessing this student
            const lastActivity = await AuditLog.findOne({
                user: mentor.user._id,
                student: student._id,
            }).sort({ createdAt: -1 });

            const timeSinceActivity = lastActivity
                ? Date.now() - lastActivity.createdAt.getTime()
                : Infinity;

            if (timeSinceActivity > INACTIVITY_THRESHOLD) {
                // Check if alert already exists
                const recentAlert = await Alert.findOne({
                    student: student._id,
                    type: 'MENTOR_INACTIVITY',
                    recipient: mentor.user._id,
                    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                });

                if (recentAlert) {
                    continue;
                }

                // Create alert for mentor
                await createAndEmitAlert({
                    type: 'MENTOR_INACTIVITY',
                    student: student._id,
                    recipient: mentor.user._id,
                    recipientRole: 'mentor',
                    title: 'Action Required: Student Inactivity',
                    message: `You haven't checked on ${student.name} in over 48 hours. Please review their progress.`,
                    priority: 'MEDIUM',
                    actionLink: `/mentees/${student._id}`,
                    metadata: {
                        hoursSinceActivity: Math.floor(timeSinceActivity / (60 * 60 * 1000)),
                    },
                });
            }
        }

        return null;
    } catch (error) {
        console.error('Error checking mentor inactivity:', error);
        return null;
    }
};

/**
 * Rule 4: New Mentee Assigned Alert
 * Triggered when a student is assigned to a mentor
 */
const notifyMenteeAssignment = async (studentId, mentorId) => {
    try {
        const student = await Student.findById(studentId);
        const mentor = await Mentor.findById(mentorId).populate('user');

        if (!student || !mentor) {
            return null;
        }

        const alert = await createAndEmitAlert({
            type: 'NEW_MENTEE_ASSIGNED',
            student: studentId,
            recipient: mentor.user._id,
            recipientRole: 'mentor',
            title: 'New Mentee Assigned',
            message: `${student.name} (${student.usn}) has been assigned to you as a mentee.`,
            priority: 'MEDIUM',
            actionLink: `/mentees/${studentId}`,
            metadata: {
                studentName: student.name,
                studentUsn: student.usn,
            },
        });

        return alert;
    } catch (error) {
        console.error('Error notifying mentee assignment:', error);
        return null;
    }
};

/**
 * Rule 5: Consent Changed Alert
 * Triggered when student changes consent settings
 */
const notifyConsentChange = async (studentId, changes) => {
    try {
        const student = await Student.findById(studentId).populate('mentor');

        if (!student || !student.mentor) {
            return null;
        }

        const changedFields = Object.keys(changes).filter(key => changes[key] !== undefined);

        if (changedFields.length === 0) {
            return null;
        }

        const alert = await createAndEmitAlert({
            type: 'CONSENT_CHANGED',
            student: studentId,
            recipient: student.mentor.user,
            recipientRole: 'mentor',
            title: 'Student Privacy Settings Updated',
            message: `${student.name} has updated their data sharing preferences.`,
            priority: 'LOW',
            actionLink: `/mentees/${studentId}`,
            metadata: {
                changes: changes,
            },
        });

        return alert;
    } catch (error) {
        console.error('Error notifying consent change:', error);
        return null;
    }
};

/**
 * Rule 6: Low Performance Alert
 * Triggered when CGPA drops below threshold
 */
const checkLowPerformanceAlert = async (studentId, oldCGPA, newCGPA) => {
    try {
        const student = await Student.findById(studentId).populate('mentor');

        if (!student || !student.mentor) {
            return null;
        }

        const CGPA_THRESHOLD = 6.0;
        const DROP_THRESHOLD = 0.5;

        let shouldAlert = false;
        let message = '';
        let priority = 'MEDIUM';

        if (newCGPA < CGPA_THRESHOLD) {
            shouldAlert = true;
            message = `${student.name}'s CGPA has dropped to ${newCGPA}, below the threshold of ${CGPA_THRESHOLD}.`;
            priority = 'HIGH';
        } else if (oldCGPA && (oldCGPA - newCGPA) >= DROP_THRESHOLD) {
            shouldAlert = true;
            message = `${student.name}'s CGPA has dropped by ${(oldCGPA - newCGPA).toFixed(2)} points.`;
            priority = 'MEDIUM';
        }

        if (shouldAlert) {
            const recentAlert = await Alert.findOne({
                student: studentId,
                type: 'LOW_PERFORMANCE',
                createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
            });

            if (recentAlert) {
                return null;
            }

            const alert = await createAndEmitAlert({
                type: 'LOW_PERFORMANCE',
                student: studentId,
                recipient: student.mentor.user,
                recipientRole: 'mentor',
                title: 'Academic Performance Alert',
                message: message,
                priority: priority,
                actionLink: `/mentees/${studentId}`,
                metadata: {
                    oldCGPA: oldCGPA,
                    newCGPA: newCGPA,
                },
            });

            return alert;
        }

        return null;
    } catch (error) {
        console.error('Error checking low performance alert:', error);
        return null;
    }
};

/**
 * Rule 7: Mentor Reassignment Alert
 * Triggered when a student is reassigned to a new mentor
 */
const notifyMentorReassignment = async (studentId, newMentorId) => {
    try {
        const student = await Student.findById(studentId);
        const newMentor = await Mentor.findById(newMentorId).populate('user');

        if (!student || !newMentor) {
            return null;
        }

        const alert = await createAndEmitAlert({
            type: 'MENTEE_REASSIGNED',
            student: studentId,
            recipient: newMentor.user._id,
            recipientRole: 'mentor',
            title: 'Mentee Reassigned to You',
            message: `${student.name} (${student.usn}) has been reassigned to you by an administrator.`,
            priority: 'MEDIUM',
            actionLink: `/mentees/${studentId}`,
            metadata: {
                studentName: student.name,
                studentUsn: student.usn,
            },
        });

        return alert;
    } catch (error) {
        console.error('Error notifying mentor reassignment:', error);
        return null;
    }
};

/**
 * Scheduled task: Check all mentor inactivity
 * Should be run periodically (e.g., daily)
 */
const runMentorInactivityCheck = async () => {
    try {
        console.log('🔍 Running mentor inactivity check...');
        const mentors = await Mentor.find({}).populate('user');

        for (const mentor of mentors) {
            await checkMentorInactivityAlert(mentor._id);
        }

        console.log('✅ Mentor inactivity check complete');
    } catch (error) {
        console.error('Error running mentor inactivity check:', error);
    }
};

module.exports = {
    checkHighRiskAlert,
    checkAttendanceDropAlert,
    checkMentorInactivityAlert,
    notifyMenteeAssignment,
    notifyMentorReassignment,
    notifyConsentChange,
    checkLowPerformanceAlert,
    runMentorInactivityCheck,
    createAndEmitAlert,
};

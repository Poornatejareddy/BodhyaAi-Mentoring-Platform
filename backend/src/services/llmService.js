/**
 * LLM Service
 * Connects backend to llm-svc microservice for RAG-based chat and recommendations
 */

const axios = require('axios');
const logger = console;

const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const REQUEST_TIMEOUT = 30000; // 30 seconds for LLM generation

class LLMService {
    /**
     * Send a message to the RAG-enhanced chat
     * @param {string} message - User message
     * @param {string} studentId - Student ID
     * @param {Object} context - Context data (academic, risk, etc.)
     * @returns {Promise<Object>} - Chat response
     */
    async chat(message, studentId, context = {}) {
        try {
            const response = await axios.post(
                `${LLM_SERVICE_URL}/rag/chat`,
                {
                    message,
                    student_id: studentId,
                    context
                },
                { timeout: REQUEST_TIMEOUT }
            );

            return {
                success: true,
                reply: response.data.reply,
                confidence: response.data.confidence,
                model: response.data.model
            };
        } catch (error) {
            logger.error('LLM Chat Error:', error.message);
            throw new Error('Failed to get AI response');
        }
    }

    /**
     * Generate a personalized study plan
     * @param {string} studentId - Student ID
     * @param {Object} academicData - Academic data (cgpa, weak subjects, etc.)
     * @returns {Promise<Object>} - Study plan
     */
    async generateStudyPlan(studentId, academicData) {
        try {
            const response = await axios.post(
                `${LLM_SERVICE_URL}/rag/study-plan`,
                {
                    student_id: studentId,
                    current_cgpa: academicData.cgpa,
                    weak_subjects: academicData.weakSubjects || [],
                    available_hours_per_week: academicData.studyHours || 10,
                    target_cgpa: academicData.targetCgpa,
                    weeks: academicData.weeks || 8
                },
                { timeout: REQUEST_TIMEOUT }
            );

            return response.data;
        } catch (error) {
            logger.error('LLM Study Plan Error:', error.message);
            throw new Error('Failed to generate study plan');
        }
    }

    /**
     * Recommend interventions for at-risk students
     * @param {string} studentId - Student ID
     * @param {string} riskLevel - Risk level (HIGH/MEDIUM/LOW)
     * @param {Object} academicData - Academic details
     * @returns {Promise<Object>} - Interventions
     */
    async recommendInterventions(studentId, riskLevel, academicData) {
        try {
            const response = await axios.post(
                `${LLM_SERVICE_URL}/rag/interventions`,
                {
                    student_id: studentId,
                    risk_level: riskLevel,
                    academic_data: academicData
                },
                { timeout: REQUEST_TIMEOUT }
            );

            return response.data;
        } catch (error) {
            logger.error('LLM Intervention Error:', error.message);
            throw new Error('Failed to get interventions');
        }
    }

    /**
     * Generate class performance report for mentors
     * @param {string} mentorId - Mentor ID
     * @param {Array} classData - List of student data
     * @param {string} focusArea - Area to focus on (e.g., "attendance", "general")
     * @returns {Promise<Object>} - Class report
     */
    async generateClassReport(mentorId, classData, focusArea = 'general') {
        try {
            const response = await axios.post(
                `${LLM_SERVICE_URL}/rag/report`,
                {
                    mentor_id: mentorId,
                    class_data: classData,
                    focus_area: focusArea
                },
                { timeout: REQUEST_TIMEOUT * 2 } // Allow more time for reports
            );

            return response.data;
        } catch (error) {
            logger.error('LLM Report Error:', error.message);
            throw new Error('Failed to generate class report');
        }
    }
}

module.exports = new LLMService();

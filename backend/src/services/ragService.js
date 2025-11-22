/**
 * RAG Service Integration
 * Connects backend to LLM microservice for RAG capabilities
 */

const axios = require('axios');

const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://localhost:8003';

class RAGService {
    /**
     * Query knowledge base with semantic search
     * @param {string} query - Search query
     * @param {number} k - Number of results
     * @param {Object} filters - Optional filters (category, tags)
     * @returns {Promise<Object>} Answer with sources and confidence
     */
    async queryKnowledgeBase(query, k = 5, filters = null) {
        try {
            const response = await axios.post(`${LLM_SERVICE_URL}/rag/query`, {
                query,
                k,
                filters,
                include_sources: true
            }, {
                timeout: 10000 // 10 second timeout
            });

            if (response.data.success) {
                return {
                    success: true,
                    answer: response.data.data.answer,
                    sources: response.data.data.sources,
                    confidence: response.data.data.confidence
                };
            } else {
                throw new Error(response.data.error || 'Query failed');
            }
        } catch (error) {
            console.error('RAG query error:', error.message);
            return {
                success: false,
                error: error.message,
                answer: 'I apologize, but I encountered an error while searching for information.'
            };
        }
    }

    /**
     * Chat with AI using RAG context
     * @param {string} message - User message
     * @param {string} studentId - Student ID for context
     * @param {Object} context - Additional context (cgpa, role, etc.)
     * @returns {Promise<Object>} AI response
     */
    async chat(message, studentId, context = {}) {
        try {
            const response = await axios.post(`${LLM_SERVICE_URL}/rag/chat`, {
                message,
                student_id: studentId,
                context
            }, {
                timeout: 15000 // 15 second timeout for generation
            });

            if (response.data.success) {
                return {
                    success: true,
                    reply: response.data.reply,
                    confidence: response.data.confidence
                };
            } else {
                throw new Error(response.data.error || 'Chat failed');
            }
        } catch (error) {
            console.error('RAG chat error:', error.message);
            return {
                success: false,
                error: error.message,
                reply: 'I apologize, but I encountered an error. Please try again later.'
            };
        }
    }

    /**
     * Generate personalized study plan
     * @param {string} studentId - Student ID
     * @param {Object} studentData - Student academic data
     * @returns {Promise<Object>} Study plan with resources
     */
    async generateStudyPlan(studentId, studentData) {
        try {
            const {
                currentCGPA,
                weakSubjects = [],
                availableHoursPerWeek = 20,
                targetCGPA = null,
                weeks = 8
            } = studentData;

            const response = await axios.post(`${LLM_SERVICE_URL}/rag/study-plan`, {
                student_id: studentId,
                current_cgpa: currentCGPA,
                weak_subjects: weakSubjects,
                available_hours_per_week: availableHoursPerWeek,
                target_cgpa: targetCGPA,
                weeks
            }, {
                timeout: 20000 // 20 second timeout for plan generation
            });

            if (response.data.success) {
                return {
                    success: true,
                    studyPlan: response.data.study_plan,
                    resources: response.data.recommended_resources,
                    confidence: response.data.confidence
                };
            } else {
                throw new Error(response.data.error || 'Study plan generation failed');
            }
        } catch (error) {
            console.error('Study plan generation error:', error.message);
            return {
                success: false,
                error: error.message,
                studyPlan: 'Unable to generate study plan at this time.'
            };
        }
    }

    /**
     * Get intervention recommendations based on risk profile
     * @param {string} studentId - Student ID
     * @param {string} riskLevel - Risk level (HIGH, MEDIUM, LOW)
     * @param {Object} academicData - Academic metrics
     * @param {Object} behavioralData - Optional behavioral data
     * @returns {Promise<Object>} Intervention recommendations
     */
    async getInterventions(studentId, riskLevel, academicData, behavioralData = null) {
        try {
            const response = await axios.post(`${LLM_SERVICE_URL}/rag/interventions`, {
                student_id: studentId,
                risk_level: riskLevel,
                academic_data: academicData,
                behavioral_data: behavioralData
            }, {
                timeout: 15000
            });

            if (response.data.success) {
                return {
                    success: true,
                    interventions: response.data.interventions,
                    resources: response.data.resources,
                    priority: response.data.priority,
                    confidence: response.data.confidence
                };
            } else {
                throw new Error(response.data.error || 'Intervention recommendation failed');
            }
        } catch (error) {
            console.error('Intervention recommendation error:', error.message);
            return {
                success: false,
                error: error.message,
                interventions: 'Unable to generate recommendations at this time.'
            };
        }
    }

    /**
     * Get RAG service statistics
     * @returns {Promise<Object>} Service stats
     */
    async getStats() {
        try {
            const response = await axios.get(`${LLM_SERVICE_URL}/rag/stats`, {
                timeout: 5000
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.error || 'Failed to get stats');
            }
        } catch (error) {
            console.error('RAG stats error:', error.message);
            return null;
        }
    }

    /**
     * Health check for RAG service
     * @returns {Promise<boolean>} Service health status
     */
    async healthCheck() {
        try {
            const response = await axios.get(`${LLM_SERVICE_URL}/health`, {
                timeout: 3000
            });
            return response.data.status === 'ok';
        } catch (error) {
            console.error('RAG service health check failed:', error.message);
            return false;
        }
    }
}

module.exports = new RAGService();

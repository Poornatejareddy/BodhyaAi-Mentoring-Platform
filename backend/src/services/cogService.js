/**
 * Cognitive Profiling Service
 * Connects backend to cog-svc microservice for BFI-44 personality trait predictions
 */

const axios = require('axios');
const logger = console;

const COG_SERVICE_URL = process.env.COG_SERVICE_URL || 'http://localhost:8001';
const REQUEST_TIMEOUT = 10000; // 10 seconds

class CogService {
    /**
     * Predict personality traits from BFI-44 survey responses
     * @param {Object} surveyData - Survey responses (Q1-Q50)
     * @returns {Promise<Object>} - OCEAN personality scores
     */
    async predictPersonality(surveyData) {
        try {
            // Transform survey data to match cog-svc schema
            const features = this.transformSurveyData(surveyData);

            const response = await axios.post(
                `${COG_SERVICE_URL}/predict`,
                features,
                { timeout: REQUEST_TIMEOUT }
            );

            logger.info('Personality prediction successful');

            // Generate insights from OCEAN scores
            const insights = this.generatePersonalityInsights(response.data.predictions);

            return {
                success: true,
                predictions: response.data.predictions, // OCEAN scores
                insights,
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            logger.error('Cog service error:', error.message);

            // Fallback to default responses
            return this.fallbackPrediction();
        }
    }

    /**
     * Transform survey responses to cog-svc feature format (Q1-Q50)
     * @param {Object|Array} surveyData - Raw survey data
     * @returns {Object} - Formatted features
     */
    transformSurveyData(surveyData) {
        const features = {};

        // If surveyData is a Map (from MongoDB)
        if (surveyData instanceof Map) {
            surveyData.forEach((value, key) => {
                features[key] = parseFloat(value);
            });
        }
        // If surveyData is already an object with Q1-Q50
        else if (typeof surveyData === 'object') {
            for (let i = 1; i <= 50; i++) {
                const key = `Q${i}`;
                features[key] = parseFloat(surveyData[key]) || 3.0; // Default to neutral
            }
        }

        return features;
    }

    /**
     * Generate human-readable insights from OCEAN scores
     * @param {Object} oceanScores - Personality trait scores
     * @returns {Array<String>} - Insight statements
     */
    generatePersonalityInsights(oceanScores) {
        const insights = [];

        // Openness insights
        if (oceanScores.Openness >= 0.7) {
            insights.push('🌟 High Openness - You are creative, curious, and open to new experiences');
        } else if (oceanScores.Openness <= 0.3) {
            insights.push('🎯 Low Openness - You prefer familiar routines and practical approaches');
        }

        // Conscientiousness insights
        if (oceanScores.Conscientiousness >= 0.7) {
            insights.push('✅ High Conscientiousness - You are organized, responsible, and goal-oriented');
        } else if (oceanScores.Conscientiousness <= 0.4) {
            insights.push('⚠️ Low Conscientiousness - You may need support with organization and meeting deadlines');
        }

        // Extraversion insights
        if (oceanScores.Extraversion >= 0.7) {
            insights.push('🙂 High Extraversion - You thrive in social settings and group work');
        } else if (oceanScores.Extraversion <= 0.3) {
            insights.push('🤔 Low Extraversion - You prefer independent work and quiet environments');
        }

        // Agreeableness insights
        if (oceanScores.Agreeableness >= 0.7) {
            insights.push('🤝 High Agreeableness - You are cooperative, empathetic, and team-oriented');
        } else if (oceanScores.Agreeableness <= 0.3) {
            insights.push('💪 Low Agreeableness - You are competitive and assertive in your approach');
        }

        // Neuroticism insights
        if (oceanScores.Neuroticism >= 0.6) {
            insights.push('⚠️ High Neuroticism - You may experience stress and benefit from stress management support');
        } else if (oceanScores.Neuroticism <= 0.3) {
            insights.push('😌 Low Neuroticism - You remain calm and emotionally stable under pressure');
        }

        return insights;
    }

    /**
     * Get detailed personality interpretation for mentors
     * @param {Object} oceanScores - OCEAN personality scores
     * @returns {Object} - Detailed interpretation
     */
    getDetailedInterpretation(oceanScores) {
        return {
            Openness: {
                score: oceanScores.Openness,
                level: this.getLevel(oceanScores.Openness),
                description: oceanScores.Openness >= 0.5
                    ? 'Enjoys exploring new ideas and creative approaches to learning'
                    : 'Prefers structured, traditional learning methods',
                mentorTip: oceanScores.Openness >= 0.5
                    ? 'Engage with project-based learning and creative assignments'
                    : 'Provide clear guidelines and step-by-step instructions',
            },
            Conscientiousness: {
                score: oceanScores.Conscientiousness,
                level: this.getLevel(oceanScores.Conscientiousness),
                description: oceanScores.Conscientiousness >= 0.5
                    ? 'Self-disciplined, organized, and responsible with deadlines'
                    : 'May struggle with time management and organization',
                mentorTip: oceanScores.Conscientiousness >= 0.5
                    ? 'Can handle independent projects with minimal supervision'
                    : 'Provide structure, deadlines, and regular check-ins',
            },
            Extraversion: {
                score: oceanScores.Extraversion,
                level: this.getLevel(oceanScores.Extraversion),
                description: oceanScores.Extraversion >= 0.5
                    ? 'Energized by social interaction and group activities'
                    : 'Prefers working independently or in small groups',
                mentorTip: oceanScores.Extraversion >= 0.5
                    ? 'Encourage participation in group projects and presentations'
                    : 'Offer one-on-one support and written communication options',
            },
            Agreeableness: {
                score: oceanScores.Agreeableness,
                level: this.getLevel(oceanScores.Agreeableness),
                description: oceanScores.Agreeableness >= 0.5
                    ? 'Cooperative, empathetic, and values harmony in teams'
                    : 'Direct, competitive, and focused on results',
                mentorTip: oceanScores.Agreeableness >= 0.5
                    ? 'Excels in collaborative environments; may avoid conflict'
                    : 'Thrives in competitive settings; provide constructive feedback carefully',
            },
            Neuroticism: {
                score: oceanScores.Neuroticism,
                level: this.getLevel(oceanScores.Neuroticism),
                description: oceanScores.Neuroticism >= 0.5
                    ? 'May experience anxiety and stress in challenging situations'
                    : 'Emotionally stable and handles pressure well',
                mentorTip: oceanScores.Neuroticism >= 0.5
                    ? 'Provide reassurance, stress management resources, and emotional support'
                    : 'Can handle high-pressure situations and tight deadlines',
            },
        };
    }

    /**
     * Helper to determine trait level
     * @param {Number} score - Trait score (0-1)
     * @returns {String} - Level description
     */
    getLevel(score) {
        if (score >= 0.7) return 'High';
        if (score >= 0.4) return 'Moderate';
        return 'Low';
    }

    /**
     * Fallback prediction when service unavailable
     * @returns {Object} - Default personality profile
     */
    fallbackPrediction() {
        logger.warn('Using fallback personality prediction');

        return {
            success: false,
            predictions: {
                Openness: 0.5,
                Conscientiousness: 0.5,
                Extraversion: 0.5,
                Agreeableness: 0.5,
                Neuroticism: 0.5,
            },
            insights: ['Personality assessment unavailable - default profile used'],
            timestamp: new Date().toISOString(),
            note: 'Cog service unavailable - using neutral scores',
        };
    }

    /**
     * Check if cog service is healthy
     * @returns {Promise<Boolean>} - Service health status
     */
    async healthCheck() {
        try {
            const response = await axios.get(`${COG_SERVICE_URL}/`, {
                timeout: 3000,
            });
            return response.data.status === 'ok';
        } catch (error) {
            logger.error('Cog service health check failed:', error.message);
            return false;
        }
    }
}

module.exports = new CogService();

/**
 * XAI (Explainable AI) Service
 * Connects backend to xai-svc for SHAP explanations and feature importance
 */

const axios = require('axios');
const logger = console;

const XAI_SERVICE_URL = process.env.XAI_SERVICE_URL || 'http://localhost:8002';
const REQUEST_TIMEOUT = 10000;

class XAIService {
    /**
     * Get SHAP explanation for a risk prediction
     * @param {String} studentId - Student ID
     * @param {Object} features - Input features used for prediction
     * @param {String} prediction - Risk prediction (HIGH/MEDIUM/LOW)
     * @returns {Promise<Object>} - Explanation with SHAP values
     */
    async getExplanation(studentId, features, prediction) {
        try {
            const response = await axios.post(
                `${XAI_SERVICE_URL}/explain`,
                {
                    student_id: studentId,
                    features,
                    prediction,
                },
                { timeout: REQUEST_TIMEOUT }
            );

            logger.info(`XAI explanation generated for student: ${studentId}`);

            return {
                success: true,
                shapValues: response.data.shap_values || {},
                featureImportance: response.data.feature_importance || [],
                insights: this.generateInsights(response.data.shap_values, features),
                recommendations: this.generateRecommendations(response.data.shap_values, prediction),
            };
        } catch (error) {
            logger.error('XAI service error:', error.message);

            // Fallback: Generate basic insights without SHAP
            return this.fallbackExplanation(features, prediction);
        }
    }

    /**
     * Get top N risk factors for a student
     * @param {String} studentId - Student ID  
     * @param {Object} features - Input features
     * @param {Number} n - Number of top factors to return
     * @returns {Promise<Array>} - Top risk factors
     */
    async getTopRiskFactors(studentId, features, n = 5) {
        try {
            const explanation = await this.getExplanation(studentId, features, null);

            if (!explanation.success || !explanation.shapValues) {
                return [];
            }

            // Sort by absolute SHAP value (impact magnitude)
            const factors = Object.entries(explanation.shapValues)
                .map(([feature, value]) => ({
                    feature,
                    impact: value,
                    absImpact: Math.abs(value),
                    currentValue: features[feature],
                }))
                .sort((a, b) => b.absImpact - a.absImpact)
                .slice(0, n);

            return factors;
        } catch (error) {
            logger.error('Error getting top risk factors:', error.message);
            return [];
        }
    }

    /**
     * Generate human-readable insights from SHAP values
     * @param {Object} shapValues - SHAP values for features
     * @param {Object} features - Actual feature values
     * @returns {Array} - Array of insight strings
     */
    generateInsights(shapValues, features) {
        if (!shapValues) return [];

        const insights = [];

        // CGPA insights
        if (shapValues.CGPA !== undefined) {
            const cgpa = features.CGPA || 0;
            if (shapValues.CGPA < 0) {
                insights.push(`Your CGPA (${cgpa.toFixed(2)}) is above average and reduces your risk`);
            } else if (shapValues.CGPA > 0) {
                insights.push(`Your CGPA (${cgpa.toFixed(2)}) is concerning and increases your risk`);
            }
        }

        // Attendance insights
        if (shapValues.Attendance !== undefined) {
            const attendance = features.Attendance || 0;
            if (shapValues.Attendance > 0 && attendance < 75) {
                insights.push(`Low attendance (${attendance}%) is a major risk factor`);
            } else if (shapValues.Attendance < 0 && attendance >= 85) {
                insights.push(`Good attendance (${attendance}%) helps reduce your risk`);
            }
        }

        // Backlogs insights
        if (shapValues.Backlogs !== undefined && features.Backlogs > 0) {
            insights.push(`You have ${features.Backlogs} backlog(s) which significantly increases risk`);
        }

        return insights;
    }

    /**
     * Generate actionable recommendations based on SHAP values
     * @param {Object} shapValues - SHAP values
     * @param {String} prediction - Risk level
     * @returns {Array} - Recommendations
     */
    generateRecommendations(shapValues, prediction) {
        if (!shapValues) return [];

        const recommendations = [];

        // Find features with positive SHAP (increasing risk)
        Object.entries(shapValues).forEach(([feature, value]) => {
            if (value > 0.05) {
                // Significant negative contributor
                switch (feature) {
                    case 'Attendance':
                        recommendations.push({
                            priority: 'HIGH',
                            action: 'Improve Attendance',
                            target: 'Aim for 85%+ attendance',
                            impact: 'Can reduce risk significantly',
                        });
                        break;
                    case 'CGPA':
                        recommendations.push({
                            priority: 'HIGH',
                            action: 'Improve Academic Performance',
                            target: 'Focus on core subjects to raise CGPA above 6.0',
                            impact: 'Critical for reducing risk',
                        });
                        break;
                    case 'Backlogs':
                        recommendations.push({
                            priority: 'URGENT',
                            action: 'Clear Backlogs',
                            target: 'Prioritize clearing pending subjects',
                            impact: 'Essential for risk reduction',
                        });
                        break;
                    case 'StudyHoursPerDay':
                        recommendations.push({
                            priority: 'MEDIUM',
                            action: 'Increase Study Time',
                            target: 'Study at least 4-5 hours daily',
                            impact: 'Improves understanding and performance',
                        });
                        break;
                }
            }
        });

        // Add general recommendations based on risk level
        if (prediction === 'HIGH') {
            recommendations.push({
                priority: 'URGENT',
                action: 'Schedule Mentor Meeting',
                target: 'Meet with your mentor within 48 hours',
                impact: 'Get personalized guidance',
            });
        }

        return recommendations;
    }

    /**
     * Generate complete explanation with warnings, insights, and recommendations
     * @param {Object} features - Student features
     * @param {String} prediction - Risk prediction (HIGH/MEDIUM/LOW)
     * @returns {Object} - Complete explanation
     */
    async generateFullExplanation(features, prediction) {
        const warnings = [];
        const insights = [];
        const recommendations = [];

        // Generate rule-based warnings
        if (features.CGPA < 5.5) {
            warnings.push(`Critical: CGPA (${features.CGPA}) is below 5.5`);
        } else if (features.CGPA < 6.5) {
            warnings.push(`Warning: CGPA (${features.CGPA}) needs improvement`);
        }

        if (features.Attendance < 75) {
            warnings.push(`Critical: Attendance (${features.Attendance}%) is below minimum requirement`);
        } else if (features.Attendance < 85) {
            warnings.push(`Warning: Attendance (${features.Attendance}%) is below recommended level`);
        }

        if (features.Backlogs > 0) {
            warnings.push(`Alert: ${features.Backlogs} backlog subject(s) pending`);
        }

        if (features.StressScore > 7) {
            warnings.push(`Concern: High stress level (${features.StressScore}/10)`);
        }

        // Generate insights
        if (features.CGPA >= 7.5) {
            insights.push('Your CGPA is strong and helps reduce risk');
        }

        if (features.Attendance >= 90) {
            insights.push('Excellent attendance record');
        }

        if (features.StudyHoursPerDay >= 4) {
            insights.push('Good study habits detected');
        }

        // Generate recommendations based on risk factors
        if (features.Attendance < 85) {
            recommendations.push({
                priority: 'HIGH',
                action: 'Improve Attendance',
                target: 'Maintain 85%+ attendance',
                impact: '15% risk reduction',
            });
        }

        if (features.CGPA < 6.5) {
            recommendations.push({
                priority: 'HIGH',
                action: 'Focus on Core Subjects',
                target: 'Raise CGPA above 6.5',
                impact: '20% risk reduction',
            });
        }

        if (features.Backlogs > 0) {
            recommendations.push({
                priority: 'URGENT',
                action: 'Clear Backlogs',
                target: `Clear all ${features.Backlogs} pending subjects`,
                impact: 'Critical for success',
            });
        }

        if (features.StudyHoursPerDay < 3) {
            recommendations.push({
                priority: 'MEDIUM',
                action: 'Increase Study Time',
                target: 'Study 4-5 hours daily',
                impact: 'Better performance',
            });
        }

        if (prediction === 'HIGH') {
            recommendations.push({
                priority: 'URGENT',
                action: 'Meet with Mentor',
                target: 'Schedule meeting within 48 hours',
                impact: 'Get personalized support',
            });
        }

        return {
            warnings,
            insights,
            recommendations,
        };
    }

    /**
     * Fallback explanation when XAI service unavailable
     * @param {Object} features - Student features
     * @param {String} prediction - Risk prediction
     * @returns {Object} - Basic explanation
     */
    fallbackExplanation(features, prediction) {
        logger.warn('Using fallback XAI explanation');

        const insights = [];
        const recommendations = [];

        // Basic rule-based insights
        if (features.CGPA < 6.0) {
            insights.push(`Your CGPA (${features.CGPA}) is below the recommended threshold`);
            recommendations.push({
                priority: 'HIGH',
                action: 'Improve CGPA',
                target: 'Aim for CGPA above 6.0',
                impact: 'Reduces academic risk',
            });
        }

        if (features.Attendance < 75) {
            insights.push(`Your attendance (${features.Attendance}%) is below 75%`);
            recommendations.push({
                priority: 'HIGH',
                action: 'Improve Attendance',
                target: 'Maintain 85%+ attendance',
                impact: 'Critical for success',
            });
        }

        return {
            success: false,
            shapValues: null,
            insights,
            recommendations,
            note: 'XAI service unavailable - using basic analysis',
        };
    }

    /**
     * Check XAI service health
     * @returns {Promise<Boolean>}
     */
    async healthCheck() {
        try {
            const response = await axios.get(`${XAI_SERVICE_URL}/`, {
                timeout: 3000,
            });
            return response.data.status === 'ok';
        } catch (error) {
            logger.error('XAI service health check failed:', error.message);
            return false;
        }
    }
}

module.exports = new XAIService();

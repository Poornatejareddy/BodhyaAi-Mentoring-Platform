/**
 * Risk Prediction Service
 * Connects backend to risk-svc microservice for academic risk predictions
 */

const axios = require('axios');
const logger = console;

const RISK_SERVICE_URL = process.env.RISK_SERVICE_URL || 'http://localhost:8000';
const REQUEST_TIMEOUT = 10000; // 10 seconds

class RiskService {
    /**
     * Predict academic risk for a student
     * @param {Object} studentData - Student risk inputs
     * @returns {Promise<Object>} - Prediction result
     */
    async predictRisk(studentData) {
        try {
            // Transform student data to match risk-svc schema
            const features = this.transformFeatures(studentData);

            const response = await axios.post(
                `${RISK_SERVICE_URL}/predict`,
                features,
                { timeout: REQUEST_TIMEOUT }
            );

            logger.info(`Risk prediction successful for features: ${JSON.stringify(features)}`);

            return {
                success: true,
                prediction: response.data.prediction, // HIGH/MEDIUM/LOW
                confidence: response.data.confidence || 0.8,
                model: 'academic_risk_pipeline',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            logger.error('Risk service error:', error.message);

            // Fallback to rule-based prediction
            return this.fallbackPrediction(studentData);
        }
    }

    /**
     * Transform student data to risk-svc feature format
     * @param {Object} studentData - Raw student data
     * @returns {Object} - Formatted features
     */
    transformFeatures(studentData) {
        return {
            CGPA: parseFloat(studentData.CGPA) || 0.0,
            Attendance: parseInt(studentData.Attendance) || 0,
            StressScore: parseInt(studentData.StressScore) || 5,
            SleepHours: parseInt(studentData.SleepHours) || 6,
            Backlogs: parseInt(studentData.Backlogs) || 0,
            StudyHoursPerDay: parseInt(studentData.StudyHoursPerDay) || 2,
            FatherIncome: parseInt(studentData.FatherIncome) || 30000,
            MotherIncome: parseInt(studentData.MotherIncome) || 20000,
            HasSiblings: studentData.HasSiblings ? 1 : 0,
            SiblingCount: parseInt(studentData.SiblingCount) || 0,
            MentalHealthIndex: parseFloat(studentData.MentalHealthIndex) || 5.0,
            ExerciseHours: parseInt(studentData.ExerciseHours) || 1,
            ScreenTime: parseInt(studentData.ScreenTime) || 6,
        };
    }

    /**
     * Fallback rule-based prediction when service unavailable
     * @param {Object} studentData - Student data
     * @returns {Object} - Prediction result
     */
    fallbackPrediction(studentData) {
        const cgpa = parseFloat(studentData.CGPA) || 0;
        const attendance = parseInt(studentData.Attendance) || 0;
        const backlogs = parseInt(studentData.Backlogs) || 0;

        let prediction = 'MEDIUM';
        let confidence = 0.6;

        // Rule-based logic
        if (cgpa < 5.5 || attendance < 75 || backlogs >= 3) {
            prediction = 'HIGH';
            confidence = 0.75;
        } else if (cgpa >= 8.0 && attendance >= 90 && backlogs === 0) {
            prediction = 'LOW';
            confidence = 0.8;
        }

        logger.warn(`Using fallback prediction: ${prediction}`);

        return {
            success: true,
            prediction,
            confidence,
            model: 'rule_based_fallback',
            timestamp: new Date().toISOString(),
            note: 'Risk service unavailable - using fallback',
        };
    }

    /**
     * Batch predict risk for multiple students
     * @param {Array} studentsData - Array of student data
     * @returns {Promise<Array>} - Array of predictions
     */
    async batchPredictRisk(studentsData) {
        const predictions = await Promise.all(
            studentsData.map((student) => this.predictRisk(student))
        );
        return predictions;
    }

    /**
     * Get risk statistics for dashboard
     * @param {Array} predictions - Array of risk predictions
     * @returns {Object} - Risk distribution stats
     */
    getRiskStats(predictions) {
        const stats = {
            high: 0,
            medium: 0,
            low: 0,
            total: predictions.length,
        };

        predictions.forEach((pred) => {
            const risk = pred.prediction.toLowerCase();
            if (stats.hasOwnProperty(risk)) {
                stats[risk]++;
            }
        });

        return stats;
    }

    /**
     * Check if risk service is healthy
     * @returns {Promise<Boolean>} - Service health status
     */
    async healthCheck() {
        try {
            const response = await axios.get(`${RISK_SERVICE_URL}/`, {
                timeout: 3000,
            });
            return response.data.status === 'ok';
        } catch (error) {
            logger.error('Risk service health check failed:', error.message);
            return false;
        }
    }
}

module.exports = new RiskService();

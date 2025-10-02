const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new Schema({
  // --- Core Link & Profile ---
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  department: { type: String },

  // --- Data for `risk-svc` (Inputs) ---
  riskInputs: {
    CGPA: Number,
    Attendance: Number,
    StressScore: Number,
    SleepHours: Number,
    Backlogs: Number,
    StudyHoursPerDay: Number,
    FatherIncome: Number,
    MotherIncome: Number,
    HasSiblings: Number,
    SiblingCount: Number,
    MentalHealthIndex: Number,
    ExerciseHours: Number,
    ScreenTime: Number,
  },

  // --- Data for `cog-svc` (Inputs) ---
  surveyResponses: {
    // Storing 50 questions, you can define them individually or use a Map
    type: Map,
    of: Number,
  },

  // --- AI Service Outputs ---
  academicRisk: {
    prediction: String, // e.g., "Safe", "Moderate", "At Risk"
    warnings: [String], // From xai-svc
    featureImportance: { type: Map, of: Number }, // From xai-svc
    lastCalculated: Date,
  },
  personalityProfile: {
    predictions: {
      Openness: Number,
      Conscientiousness: Number,
      Extraversion: Number,
      Agreeableness: Number,
      Neuroticism: Number,
    },
    insights: [String], // From xai-svc
    lastCalculated: Date,
  },
  
  // --- Relationships ---
  mentor: { type: Schema.Types.ObjectId, ref: 'Mentor' },

}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
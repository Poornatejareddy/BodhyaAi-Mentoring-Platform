const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    // --- Core Student Identity ---
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Basic student details (NEW)
    name: { type: String, required: true },   // Full Name
    usn: { type: String, required: true, unique: true }, // Unique Student Number
    department: { type: String, required: true },
    section: { type: String, required: true },

    // --- Academic History ---
    academicHistory: {
      sgpa: {
        type: Map,
        of: Number,
        default: {},
      },
      internalAssessments: {
        type: Map,
        of: Number,
        default: {},
      },
      parentEducation: { type: String },
    },

    // --- Data for risk-svc (Inputs) ---
    riskInputs: {
      CGPA: Number,
      Attendance: Number,
      StressScore: Number,
      SleepHours: Number,
      Backlogs: Number,
      StudyHoursPerDay: Number,
      IAT1: Number,
      IAT2: Number,
      IAT3: Number,
      FatherIncome: Number,
      MotherIncome: Number,
      HasSiblings: Number,
      SiblingCount: Number,
      MentalHealthIndex: Number,
      ExerciseHours: Number,
      ScreenTime: Number,
      InternetAccess: { type: Boolean },
      PartTimeJob: { type: Boolean },
      SocialHours: Number,
    },

    // --- Data for cog-svc ---
    surveyResponses: {
      type: Map,
      of: Number,
    },

    // --- AI Service Outputs ---
    academicRisk: {
      prediction: String, // HIGH/MEDIUM/LOW
      confidence: Number,
      warnings: [String],
      insights: [String],
      recommendations: [{ type: Schema.Types.Mixed }],
      featureImportance: { type: Map, of: Number },
      featureContributions: [{
        feature: String,
        value: Number
      }],
      calculatedAt: Date,
      calculatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      model: String,
    },

    personalityProfile: {
      predictions: {
        Openness: Number,
        Conscientiousness: Number,
        Extraversion: Number,
        Agreeableness: Number,
        Neuroticism: Number,
      },
      learningStyle: {
        visual: Number,
        auditory: Number,
        kinesthetic: Number,
      },
      strengths: [String],
      growthAreas: [String],
      careerSuggestions: [{
        title: String,
        compatibility: Number,
      }],
      insights: [String],
      lastCalculated: Date,
    },

    // --- Student Engagement ---
    mentor: { type: Schema.Types.ObjectId, ref: 'Mentor' },
    supportEngagement: {
      mentorMeetings: { type: Number, default: 0 },
      counselingSessions: { type: Number, default: 0 },
      clubParticipation: { type: Number, default: 0 },
    },

    // --- Consent Management (Student Privacy Controls) ---
    consent: {
      shareRisk: {
        type: Boolean,
        default: true, // Allow mentor to see risk predictions by default
      },
      sharePersonality: {
        type: Boolean,
        default: true, // Allow mentor to see personality insights
      },
      shareBehavior: {
        type: Boolean,
        default: true, // Allow mentor to see behavior analytics
      },
      shareAcademicHistory: {
        type: Boolean,
        default: true, // Allow mentor to see full academic history
      },
      allowChat: {
        type: Boolean,
        default: true, // Allow mentor to initiate chat
      },
      shareWithResearch: {
        type: Boolean,
        default: false, // Opt-in for anonymized research data
      },
    },
  },
  { timestamps: true }
);

// Indexes for query performance
studentSchema.index({ mentor: 1 });

module.exports = mongoose.model('Student', studentSchema);

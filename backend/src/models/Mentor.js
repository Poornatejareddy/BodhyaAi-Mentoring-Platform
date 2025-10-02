const mongoose = require('mongoose');
const { Schema } = mongoose;

const mentorSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  department: { type: String, required: true },
  specialization: [String],
  
  // A list of students assigned to this mentor
  mentees: [{
    type: Schema.Types.ObjectId,
    ref: 'Student'
  }],

}, { timestamps: true });

module.exports = mongoose.model('Mentor', mentorSchema);
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  personalInfo: {
    name: String,
    email: String,
    phone: String,
    linkedin: String,
    github: String,
    portfolio: String
  },
  education: [],
  skills: {
    technical: [String],
    soft: [String]
  },
  projects: [],
  experience: [],
  certifications: [String],
  achievements: [String],
  generatedResume: String,
  pdfPath: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Resume', resumeSchema);

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
  education: [{
    institution: String,
    degree: String,
    year: String,
    cgpa: String
  }],
  skills: {
    technical: [String],
    soft: [String]
  },
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    link: String,
    highlights: [String]
  }],
  experience: [{
    company: String,
    role: String,
    duration: String,
    description: [String]
  }],
  certifications: [String],
  achievements: [String],
  generatedResume: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', resumeSchema);
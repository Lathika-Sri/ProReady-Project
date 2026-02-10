const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, required: true },
  duration: { type: Number, required: true }, // in weeks
  weeklyPlan: [{
    week: Number,
    title: String,
    focus: [String],
    topics: [String],
    resources: [String],
    estimatedHours: Number
  }],
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
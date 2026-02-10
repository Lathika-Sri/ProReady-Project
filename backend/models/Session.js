const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number }, // in minutes
  date: { type: Date, required: true },
  activityDetails: {
    problemsSolved: { type: Number, default: 0 },
    topicsStudied: [String],
    notes: String
  },
  isActive: { type: Boolean, default: false }
}, { timestamps: true });

// Index for faster queries
sessionSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Session', sessionSchema);
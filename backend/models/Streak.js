const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  totalSessionDays: { type: Number, default: 0 },
  resourceStreaks: [{
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Streak', streakSchema);
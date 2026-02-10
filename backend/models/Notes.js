const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  originalContent: { type: String, required: true },
  summary: String,
  keyPoints: [String],
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

notesSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notes', notesSchema);
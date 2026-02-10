const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const Notes = require('../models/Notes');
const Roadmap = require('../models/Roadmap');
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');

// Generate Resume
router.post('/resume/generate', auth, async (req, res) => {
  try {
    const resumeData = req.body;
    
    const generatedText = await aiService.generateResume(resumeData);
    
    const resume = new Resume({
      userId: req.user.id,
      ...resumeData,
      generatedResume: generatedText,
      updatedAt: new Date()
    });
    
    await resume.save();
    res.json({ message: 'Resume generated', resume });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user resumes
router.get('/resume', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ resumes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Summarize Notes
router.post('/notes/summarize', auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const result = await aiService.summarizeNotes(content, title);
    
    const notes = new Notes({
      userId: req.user.id,
      title,
      originalContent: content,
      summary: result.summary,
      keyPoints: result.keyPoints || [],
      updatedAt: new Date()
    });
    
    await notes.save();
    res.json({ message: 'Notes summarized', notes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user notes
router.get('/notes', auth, async (req, res) => {
  try {
    const notes = await Notes.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate Roadmap
router.post('/roadmap/generate', auth, async (req, res) => {
  try {
    const { targetRole, duration } = req.body;
    
    const result = await aiService.generateRoadmap(targetRole, duration);
    
    const roadmap = new Roadmap({
      userId: req.user.id,
      targetRole,
      duration,
      weeklyPlan: result.weeklyPlan || []
    });
    
    await roadmap.save();
    res.json({ message: 'Roadmap generated', roadmap });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user roadmaps
router.get('/roadmap', auth, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user.id })
      .sort({ generatedAt: -1 });
    res.json({ roadmaps });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Delete note
router.delete('/notes/:id', auth, async (req, res) => {
  try {
    await Notes.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete roadmap
router.delete('/roadmap/:id', auth, async (req, res) => {
  try {
    await Roadmap.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    res.json({ message: 'Roadmap deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
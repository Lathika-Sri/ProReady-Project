// routes/ai.js - FINAL CLEAN VERSION (NO FILE STORAGE)

const express = require('express');
const router = express.Router();

const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const pdfGenerator = require('../services/pdfGenerator');


/* ============================
   RESUME GENERATION (TXT + PDF)
============================ */

router.post('/resume/generate', auth, async (req, res) => {
  try {
    console.log('📝 Starting resume generation...');
    const resumeData = req.body;

    // Validate required fields
    if (
      !resumeData.personalInfo ||
      !resumeData.personalInfo.name ||
      !resumeData.personalInfo.email
    ) {
      return res.status(400).json({
        message: 'Name and email are required fields'
      });
    }

    // STEP 1: Generate AI Resume Text
    console.log('🤖 Generating resume text...');
    let generatedText;

    try {
      generatedText = await aiService.generateResume(resumeData);
      console.log('✅ AI resume generated');
    } catch (error) {
      console.log('⚠️ AI failed, using template fallback');
      generatedText = aiService.generateTemplateResume(resumeData);
    }

    // STEP 2: Generate PDF
    console.log('📄 Generating PDF...');
    const pdfBuffer = await pdfGenerator.generateATSResume(resumeData);
    console.log('✅ PDF buffer created');

    // STEP 3: Save resume text to DB (NO file saving)
    const resume = new Resume({
      userId: req.user.id,
      ...resumeData,
      generatedResume: generatedText
    });

    await resume.save();
    console.log('✅ Resume saved to database');

    // STEP 4: Send PDF directly to frontend
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    return res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ Resume Generation Error:', error);
    return res.status(500).json({
      message: 'Resume generation failed. Please try again.'
    });
  }
});


/* ============================
   GET ALL SAVED RESUMES (TEXT)
============================ */

router.get('/resume', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ resumes });

  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({ message: error.message });
  }
});


/* ============================
   DELETE RESUME (TEXT ONLY)
============================ */

router.delete('/resume/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json({ message: 'Resume deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});


/* ============================
   HEALTH CHECK
============================ */

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Resume Generator',
    timestamp: new Date().toISOString()
  });
});


module.exports = router;

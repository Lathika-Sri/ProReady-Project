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
    // STEP 4: Send BOTH text + PDF (base64)
return res.json({
  resume: {
    generatedResume: generatedText
  },
  pdfBase64: pdfBuffer.toString('base64')
});

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

// Generate PDF for existing resume
router.get('/resume/:id/pdf', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const pdfBuffer = await pdfGenerator.generateATSResume(resume);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF regeneration error:', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});
/* ============================
   GET ALL SAVED RESUMES
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
/* ============================
   ROADMAP GENERATION
============================ */

router.post('/roadmap/generate', auth, async (req, res) => {
  try {
    const { career } = req.body;

    if (!career) {
      return res.status(400).json({ message: 'Career field is required' });
    }

    const roadmap = await aiService.generateRoadmap(career);

    res.json({ roadmap });

  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({ message: 'Failed to generate roadmap' });
  }
});
/* ============================
   NOTES SUMMARIZER
============================ */

router.post('/notes/summarize', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const summary = await aiService.summarizeNotes(content);

    res.json({ summary });

  } catch (error) {
    console.error('Notes summarization error:', error);
    res.status(500).json({ message: 'Failed to summarize notes' });
  }
});


module.exports = router;

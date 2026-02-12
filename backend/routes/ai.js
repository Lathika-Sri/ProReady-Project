// routes/ai.js - IMPROVED WITH BETTER ERROR HANDLING

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const pdfGenerator = require('../services/pdfGenerator');


/* ============================
   RESUME GENERATION - IMPROVED
============================ */

router.post('/resume/generate', auth, async (req, res) => {
  try {
    console.log('📝 Starting resume generation...');
    const resumeData = req.body;

    // Validate required fields
    if (!resumeData.personalInfo || !resumeData.personalInfo.name || !resumeData.personalInfo.email) {
      return res.status(400).json({ 
        message: 'Name and email are required fields' 
      });
    }

    // STEP 1: Generate AI text (with fallback)
    console.log('🤖 Generating resume text...');
    let generatedText;
    let usedFallback = false;
    
    try {
      generatedText = await aiService.generateResume(resumeData);
      console.log('✅ Resume text generated successfully');
    } catch (error) {
      console.error('⚠️ AI generation failed, using template:', error.message);
      generatedText = aiService.generateTemplateResume(resumeData);
      usedFallback = true;
      console.log('✅ Template resume generated');
    }

    // STEP 2: Generate PDF
    console.log('📄 Generating PDF...');
    let pdfBuffer;
    let pdfFilename = null;
    let pdfUrl = null;
    
    try {
      pdfBuffer = await pdfGenerator.generateATSResume(resumeData);
      console.log('✅ PDF buffer created');
      
      // Save PDF to disk
      pdfFilename = `resume_${req.user.id}_${Date.now()}.pdf`;
      const uploadsDir = path.join(__dirname, '../uploads/resumes');
      
      await fs.mkdir(uploadsDir, { recursive: true });
      const pdfPath = path.join(uploadsDir, pdfFilename);
      
      await fs.writeFile(pdfPath, pdfBuffer);
      console.log('✅ PDF saved to disk');
      
      pdfUrl = `/ai/resume/download-pdf/${pdfFilename}`;
      
    } catch (pdfError) {
      console.error('⚠️ PDF generation failed:', pdfError.message);
      // Continue without PDF - at least save the text
    }

    // STEP 3: Save to database
    console.log('💾 Saving to database...');
    const resume = new Resume({
      userId: req.user.id,
      ...resumeData,
      generatedResume: generatedText,
      pdfPath: pdfFilename
    });

    await resume.save();
    console.log('✅ Resume saved to database');

    // Success response
    res.json({
      message: 'Resume generated successfully',
      resume,
      pdfUrl,
      warning: usedFallback ? 'AI service unavailable. Template-based resume generated.' : null
    });

  } catch (error) {
    console.error('❌ Resume Generation Error:', error);
    console.error('Stack:', error.stack);
    
    // Send detailed error in development, generic in production
    res.status(500).json({ 
      message: 'Resume generation failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


// Download PDF
router.get('/resume/download-pdf/:filename', auth, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security validation
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }

    const pdfPath = path.join(__dirname, '../uploads/resumes', filename);

    // Check if file exists
    try {
      await fs.access(pdfPath);
    } catch {
      console.error(`PDF not found: ${pdfPath}`);
      return res.status(404).json({ 
        message: 'PDF file not found. It may have been deleted during server restart.' 
      });
    }

    // Send file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileBuffer = await fs.readFile(pdfPath);
    res.send(fileBuffer);

  } catch (error) {
    console.error('PDF Download Error:', error);
    res.status(500).json({ message: 'Error downloading PDF' });
  }
});


// Get all resumes
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


// Delete resume
router.delete('/resume/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Delete PDF file if exists
    if (resume.pdfPath) {
      const pdfPath = path.join(__dirname, '../uploads/resumes', resume.pdfPath);
      try {
        await fs.unlink(pdfPath);
        console.log('✅ PDF file deleted');
      } catch (err) {
        console.log('⚠️ PDF file not found or already deleted');
      }
    }

    res.json({ message: 'Resume deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});


// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'AI Resume Generator',
    timestamp: new Date().toISOString()
  });
});


module.exports = router;
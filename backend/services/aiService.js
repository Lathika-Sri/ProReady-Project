// services/aiService.js - IMPROVED VERSION WITH FALLBACK

class AIService {
  
  // Main resume generation with retry logic
  async generateResume(resumeData, retryCount = 0) {
    try {
      // Try AI generation first
      return await this.generateWithGemini(resumeData);
      
    } catch (error) {
      console.error('AI Generation Error:', error.message);
      
      // Check if it's a quota error
      if (error.message && (error.message.includes('Quota exceeded') || error.message.includes('429'))) {
        
        // If we haven't retried yet, try fallback
        if (retryCount === 0) {
          console.log('⚠️ API quota exceeded, using template-based generation');
          return this.generateTemplateResume(resumeData);
        }
      }
      
      // For any other error, use template
      console.log('⚠️ AI generation failed, using template-based generation');
      return this.generateTemplateResume(resumeData);
    }
  }

  // Template-based resume generation (NO API NEEDED)
  generateTemplateResume(resumeData) {
    const { personalInfo, education, skills, projects, experience, certifications, achievements } = resumeData;
    
    let resume = '';
    
    // Header
    resume += `${personalInfo.name.toUpperCase()}\n`;
    resume += '='.repeat(personalInfo.name.length) + '\n\n';
    
    // Contact Info
    const contact = [
      personalInfo.email,
      personalInfo.phone,
      personalInfo.linkedin,
      personalInfo.github,
      personalInfo.portfolio
    ].filter(Boolean);
    
    if (contact.length > 0) {
      resume += contact.join(' | ') + '\n\n';
    }
    
    // Professional Summary
    resume += 'PROFESSIONAL SUMMARY\n';
    resume += '-'.repeat(50) + '\n';
    resume += `Motivated professional with expertise in ${skills.technical.slice(0, 3).join(', ')}. `;
    resume += `Seeking opportunities to leverage technical skills and contribute to innovative projects.\n\n`;
    
    // Education
    if (education && education.length > 0) {
      resume += 'EDUCATION\n';
      resume += '-'.repeat(50) + '\n';
      education.forEach(edu => {
        resume += `${edu.institution}\n`;
        resume += `${edu.degree}`;
        if (edu.cgpa) resume += ` | CGPA: ${edu.cgpa}`;
        if (edu.year) resume += ` | ${edu.year}`;
        resume += '\n\n';
      });
    }
    
    // Technical Skills
    if (skills.technical && skills.technical.length > 0) {
      resume += 'TECHNICAL SKILLS\n';
      resume += '-'.repeat(50) + '\n';
      resume += skills.technical.join(' • ') + '\n\n';
    }
    
    // Soft Skills
    if (skills.soft && skills.soft.length > 0) {
      resume += 'SOFT SKILLS\n';
      resume += '-'.repeat(50) + '\n';
      resume += skills.soft.join(' • ') + '\n\n';
    }
    
    // Experience
    if (experience && experience.length > 0 && experience[0].company) {
      resume += 'PROFESSIONAL EXPERIENCE\n';
      resume += '-'.repeat(50) + '\n';
      experience.forEach(exp => {
        if (exp.company) {
          resume += `${exp.role} | ${exp.company}\n`;
          resume += `${exp.duration}\n`;
          if (exp.description && exp.description.length > 0) {
            exp.description.forEach(point => {
              if (point) resume += `• ${point}\n`;
            });
          }
          resume += '\n';
        }
      });
    }
    
    // Projects
    if (projects && projects.length > 0) {
      resume += 'PROJECTS\n';
      resume += '-'.repeat(50) + '\n';
      projects.forEach(proj => {
        if (proj.name) {
          resume += `${proj.name}\n`;
          if (proj.technologies && proj.technologies.length > 0) {
            resume += `Technologies: ${proj.technologies.join(', ')}\n`;
          }
          if (proj.description) {
            resume += `${proj.description}\n`;
          }
          if (proj.link) {
            resume += `Link: ${proj.link}\n`;
          }
          resume += '\n';
        }
      });
    }
    
    // Certifications
    if (certifications && certifications.length > 0) {
      resume += 'CERTIFICATIONS\n';
      resume += '-'.repeat(50) + '\n';
      certifications.forEach(cert => {
        resume += `• ${cert}\n`;
      });
      resume += '\n';
    }
    
    // Achievements
    if (achievements && achievements.length > 0) {
      resume += 'ACHIEVEMENTS\n';
      resume += '-'.repeat(50) + '\n';
      achievements.forEach(ach => {
        resume += `• ${ach}\n`;
      });
      resume += '\n';
    }
    
    return resume;
  }

  // Original Gemini API call (keep this as is)
  async generateWithGemini(resumeData) {
    // Your existing Gemini API code here
    const axios = require('axios');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `Generate a professional ATS-friendly resume based on this data:\n\n${JSON.stringify(resumeData, null, 2)}\n\nFormat it professionally with clear sections.`
          }]
        }]
      }
    );
    
    return response.data.candidates[0].content.parts[0].text;
  }
  /* ============================
   ROADMAP GENERATION
============================ */

async generateRoadmap(targetRole, duration = 8) {
  const axios = require('axios');

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `
Create a progressive ${duration}-week learning roadmap for becoming a ${targetRole}.

Structure:
- Week 1-2: Fundamentals
- Middle weeks: Intermediate concepts
- Final weeks: Advanced topics + Projects + Interview preparation

Each week MUST be different and progressively harder.

Return ONLY valid JSON in this exact format:

{
  "weeklyPlan": [
    {
      "week": 1,
      "title": "Clear week title",
      "estimatedHours": 10,
      "focus": ["focus1", "focus2"],
      "topics": ["topic1", "topic2"],
      "resources": ["resource1", "resource2"]
    }
  ]
}
`

          }]
        }]
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;

    const cleaned = text.replace(/```json|```/g, '').trim();
return JSON.parse(cleaned);


  } catch (error) {
    console.error("Roadmap AI error:", error.message);

    // Simple fallback roadmap
    return {
      weeklyPlan: Array.from({ length: duration }, (_, i) => ({
        week: i + 1,
        title: `Week ${i + 1} - Core Preparation`,
        estimatedHours: 10,
        focus: ["Fundamentals", "Practice"],
        topics: ["Core Concepts", "Projects"],
        resources: ["YouTube", "Official Docs"]
      }))
    };
  }
}


/* ============================
   NOTES SUMMARIZER
============================ */

async summarizeNotes(content) {
  const axios = require('axios');

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `
Summarize the following notes clearly.

Return response strictly in JSON format:

{
  "title": "Short title",
  "summary": "Short summary paragraph",
  "keyPoints": ["point1", "point2", "point3"]
}

Notes:
${content}
`
          }]
        }]
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;

    return JSON.parse(text);

  } catch (error) {
    console.error("Notes AI error:", error.message);

    // Simple fallback
    return {
      title: "Summary",
      summary: content.substring(0, 300) + "...",
      keyPoints: ["Review main ideas", "Revise important topics"]
    };
  }
}

}

module.exports = new AIService();
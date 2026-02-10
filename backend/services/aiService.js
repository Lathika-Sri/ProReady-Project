// services/aiService.js
// FREE Gemini API with PROPER ERROR HANDLING

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'models/gemini-2.5-flash';

const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/${MODEL_NAME}:generateContent`;



class AIService {
  
  // Generate Resume using FREE Gemini API
  async generateResume(resumeData) {
    try {
      console.log('🔄 Generating resume...');
      
      const prompt = `Create a professional, ATS-friendly resume based on the following information. 
Format it in a clean, structured way suitable for placement applications.

Personal Information:
Name: ${resumeData.personalInfo?.name || 'Not provided'}
Email: ${resumeData.personalInfo?.email || 'Not provided'}
Phone: ${resumeData.personalInfo?.phone || 'Not provided'}
LinkedIn: ${resumeData.personalInfo?.linkedin || 'Not provided'}
GitHub: ${resumeData.personalInfo?.github || 'Not provided'}
Portfolio: ${resumeData.personalInfo?.portfolio || 'Not provided'}

Education:
${resumeData.education?.map(edu => 
  `- ${edu.degree} from ${edu.institution} (${edu.year}) - CGPA: ${edu.cgpa}`
).join('\n') || 'Not provided'}

Technical Skills: ${resumeData.skills?.technical?.join(', ') || 'Not provided'}
Soft Skills: ${resumeData.skills?.soft?.join(', ') || 'Not provided'}

Projects:
${resumeData.projects?.map(proj => 
  `- ${proj.name}: ${proj.description}\n  Technologies: ${proj.technologies?.join(', ')}\n  Link: ${proj.link || 'N/A'}`
).join('\n\n') || 'Not provided'}

Experience:
${resumeData.experience?.map(exp => 
  `- ${exp.role} at ${exp.company} (${exp.duration})\n  ${Array.isArray(exp.description) ? exp.description.join('. ') : exp.description}`
).join('\n\n') || 'Not provided'}

Certifications: ${resumeData.certifications?.join(', ') || 'None'}
Achievements: ${resumeData.achievements?.join(', ') || 'None'}

Please create a well-structured resume with:
1. Strong action verbs
2. Quantifiable achievements where possible
3. ATS-optimized keywords
4. Professional formatting
5. Clear section headers

Return ONLY the resume text, no extra commentary.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      // FIXED: Proper error handling
      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.error?.message || `API Error: ${response.status}`);
      }

      // FIXED: Check if response has expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error('❌ Unexpected response structure:', data);
        throw new Error('Invalid API response structure');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      console.log('✅ Resume generated successfully');
      
      return generatedText;
    } catch (error) {
      console.error('❌ Resume generation error:', error);
      throw new Error(`Resume generation failed: ${error.message}`);
    }
  }

  // Summarize Notes using FREE Gemini API
  async summarizeNotes(notesContent, title) {
    try {
      console.log('🔄 Summarizing notes...');
      
      const prompt = `Summarize the following study notes on "${title}". 
Provide:
1. A concise summary (2-3 paragraphs)
2. 5-7 key points
3. Important concepts to remember

Notes:
${notesContent}

Format your response as JSON with this exact structure (no markdown, just raw JSON):
{
  "summary": "your summary here",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "importantConcepts": ["concept 1", "concept 2", "concept 3"]
}`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      // FIXED: Proper error handling
      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.error?.message || `API Error: ${response.status}`);
      }

      // FIXED: Check if response has expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error('❌ Unexpected response structure:', data);
        throw new Error('Invalid API response structure');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response (remove markdown code blocks if present)
      let jsonText = generatedText;
      
      // Remove ```json and ``` if present
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try to find JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Notes summarized successfully');
          return {
            summary: parsed.summary || generatedText,
            keyPoints: parsed.keyPoints || [],
            importantConcepts: parsed.importantConcepts || []
          };
        } catch (parseError) {
          console.warn('⚠️ Could not parse JSON, returning raw text');
          return {
            summary: generatedText,
            keyPoints: [],
            importantConcepts: []
          };
        }
      }
      
      console.log('✅ Notes summarized (plain text)');
      return {
        summary: generatedText,
        keyPoints: [],
        importantConcepts: []
      };
    } catch (error) {
      console.error('❌ Notes summarization error:', error);
      throw new Error(`Notes summarization failed: ${error.message}`);
    }
  }

  // Generate Roadmap using FREE Gemini API
  async generateRoadmap(targetRole, duration) {
    try {
      console.log(`🔄 Generating ${duration}-week roadmap for ${targetRole}...`);
      
      const prompt = `Create a detailed ${duration}-week preparation roadmap for a "${targetRole}" position for placement preparation.

For each week, provide:
1. Week number and title
2. Main focus areas (2-3 areas)
3. Specific topics to study (3-5 topics)
4. Recommended resources/platforms (2-3 resources)
5. Estimated study hours per week

Make it practical, structured, and suitable for placement preparation.
Cover technical skills, projects, DSA practice, and soft skills.

Format your response as JSON with this exact structure (no markdown, just raw JSON):
{
  "weeklyPlan": [
    {
      "week": 1,
      "title": "Foundations",
      "focus": ["Arrays", "Strings"],
      "topics": ["Two pointers", "Sliding window", "Basic string manipulation"],
      "resources": ["LeetCode Arrays", "GeeksforGeeks"],
      "estimatedHours": 20
    },
    {
      "week": 2,
      "title": "Next topic",
      "focus": ["..."],
      "topics": ["..."],
      "resources": ["..."],
      "estimatedHours": 20
    }
  ],
  "overallStrategy": "Brief 2-3 sentence strategy summary"
}

Create all ${duration} weeks. Return ONLY valid JSON.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      // FIXED: Proper error handling
      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.error?.message || `API Error: ${response.status}`);
      }

      // FIXED: Check if response has expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error('❌ Unexpected response structure:', data);
        throw new Error('Invalid API response structure');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response (remove markdown code blocks if present)
      let jsonText = generatedText;
      
      // Remove ```json and ``` if present
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Try to find JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ Roadmap generated successfully');
          return {
            weeklyPlan: parsed.weeklyPlan || [],
            overallStrategy: parsed.overallStrategy || ''
          };
        } catch (parseError) {
          console.error('❌ Could not parse JSON:', parseError);
          throw new Error('Failed to parse roadmap JSON');
        }
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('❌ Roadmap generation error:', error);
      throw new Error(`Roadmap generation failed: ${error.message}`);
    }
  }
}

module.exports = new AIService();
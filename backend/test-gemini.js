require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ MUST match ListModels output EXACTLY
const MODEL_NAME = 'models/gemini-2.5-flash';

const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/${MODEL_NAME}:generateContent`;

async function testGemini() {
  console.log('Testing Gemini API...');
  console.log('API Key:', GEMINI_API_KEY ? 'Present ✓' : 'Missing ✗');
  console.log('Model:', MODEL_NAME);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Say hello in 5 words' }]
          }
        ]
      })
    });

    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      console.log('✅ API works!');
      console.log('Response:', text);
    } else {
      console.log('❌ No text returned');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

testGemini();

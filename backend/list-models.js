require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  console.log('Status:', res.status);
  console.log(JSON.stringify(data, null, 2));
}

listModels();

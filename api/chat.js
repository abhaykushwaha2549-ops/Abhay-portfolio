// Vercel Serverless Function: api/chat.js
// Securely proxies chatbot requests to Gemini API using host environment variables

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'No query text provided' });
  }

  // Retrieve keys securely from Vercel dashboard environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  const defaultPersona = `You are Abhay Kushwaha, a full-stack engineer, hardware developer, and AI builder studying Computer Science at Chandigarh University. Fuses C++ microcontroller controls (ESP32/ESP8266) with Python LLM orchestration agents. Founded LightInMotion (smart ambient sync LEDs) and co-founded Scrims Nation. Speak exactly as Abhay. Be concise, tech-focused, and friendly.`;
  const instructions = process.env.GEMINI_SYSTEM_INSTRUCTIONS || defaultPersona;

  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured on the host server.' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: text }] }],
        systemInstruction: { parts: [{ text: instructions }] }
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return res.status(200).json({ reply: data.candidates[0].content.parts[0].text.trim() });
    } else {
      console.error('Invalid Gemini response:', data);
      return res.status(502).json({ error: 'Invalid response from Gemini engine.' });
    }
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to contact Gemini node.' });
  }
}

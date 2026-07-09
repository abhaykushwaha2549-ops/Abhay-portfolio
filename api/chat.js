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
    const fullText = `${instructions}\n\nUser: ${text}`;
    
    const queryModel = async (modelName) => {
      const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: fullText }] }]
        })
      });
      return res;
    };

    let response = await queryModel('gemini-1.5-flash');
    let data = await response.json();

    // Self-healing: if model is not found, dynamically list available models and try the best match
    if (data.error && (data.error.message.includes('not found') || data.error.message.includes('not supported'))) {
      console.log('Model gemini-1.5-flash not found or supported, querying available list...');
      try {
        const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();
        
        if (listData.models && listData.models.length > 0) {
          const candidate = listData.models.find(m => 
            m.name.includes('gemini') && 
            m.supportedGenerationMethods && 
            m.supportedGenerationMethods.includes('generateContent')
          );
          
          if (candidate) {
            const cleanModelName = candidate.name.replace('models/', '');
            console.log(`Discovered active model on this project: ${cleanModelName}, retrying...`);
            response = await queryModel(cleanModelName);
            data = await response.json();
          }
        }
      } catch (err) {
        console.error('Self-healing model listing failed:', err);
      }
    }

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return res.status(200).json({ reply: data.candidates[0].content.parts[0].text.trim() });
    } else {
      console.error('Invalid Gemini response:', data);
      const errMsg = data.error ? data.error.message : 'Invalid response from Gemini engine.';
      return res.status(502).json({ error: errMsg });
    }
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to contact Gemini node.' });
  }
}

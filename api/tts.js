// Vercel Serverless Function: api/tts.js
// Securely proxies text-to-speech requests to ElevenLabs using Vercel environment variables

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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
    return res.status(400).json({ error: 'No text provided' });
  }

  // Retrieve ElevenLabs keys securely from Vercel dashboard environment variables
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    return res.status(500).json({ error: 'ElevenLabs API key or Voice ID is not configured on Vercel.' });
  }

  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail ? errData.detail.message : 'ElevenLabs synthesis failed');
    }

    const buffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    return res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    console.error('TTS Proxy Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

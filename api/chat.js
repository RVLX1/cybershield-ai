export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'API key not configured' });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    const body = {
      contents: [{
        parts: [{
          text: `أنت خبير أمن سيبراني محترف. أجب بالعربية بشكل مفصل ودقيق.\n\nسؤال: ${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const err = await resp.text();
      return res.status(500).json({ error: `Gemini API error: ${err}` });
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ response: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

import { synthesizeMp3 } from '../lib/fishTts.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};
    const text = body.text || body.script || '';
    const voiceId = body.voiceId || undefined;

    const { buffer, cached, key } = await synthesizeMp3(text, { voiceId });
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('X-TTS-Cache', cached ? 'HIT' : 'MISS');
    res.setHeader('X-TTS-Key', key);
    res.status(200).send(buffer);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      error: err.message || 'TTS failed',
      code: err.code || 'TTS_ERROR',
    });
  }
}

export const config = {
  api: {
    responseLimit: '10mb',
  },
};

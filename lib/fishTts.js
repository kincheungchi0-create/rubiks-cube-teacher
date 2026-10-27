/**
 * Shared Fish Audio Drama-3 TTS helper.
 * Env:
 *   FISH_AUDIO_API_KEY (required)
 *   FISH_AUDIO_VOICE_ID (optional Cantonese voice reference_id)
 */

const DEFAULT_VOICE = 'c6f0895649b34b07baf94bdae0607500'; // public 粵語 voice on fish.audio
const cache = new Map(); // text hash -> Buffer
const MAX_CACHE = 80;

function hashText(text) {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

export function wrapCommentary(script) {
  // Drama-3 direction: Hong Kong Cantonese teaching tone
  const trimmed = String(script || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('[')) return trimmed;
  return `[用香港粵語、親切清晰嘅教學口吻，語速適中，像面對面教人扭魔方] ${trimmed}`;
}

export async function synthesizeMp3(rawText, { voiceId } = {}) {
  const apiKey = process.env.FISH_AUDIO_API_KEY;
  if (!apiKey) {
    const err = new Error('FISH_AUDIO_API_KEY is not set');
    err.status = 503;
    err.code = 'TTS_NOT_CONFIGURED';
    throw err;
  }

  const text = wrapCommentary(rawText);
  if (!text) {
    const err = new Error('Missing text');
    err.status = 400;
    throw err;
  }
  if (text.length > 4000) {
    const err = new Error('Text too long');
    err.status = 400;
    throw err;
  }

  const voice = voiceId || process.env.FISH_AUDIO_VOICE_ID || DEFAULT_VOICE;
  const key = `${voice}::${hashText(text)}`;
  if (cache.has(key)) return { buffer: cache.get(key), cached: true, key };

  const res = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      model: 'drama-3',
    },
    body: JSON.stringify({
      text,
      reference_id: voice,
      format: 'mp3',
      mp3_bitrate: 128,
      normalize: true,
      latency: 'normal',
      prosody: { speed: 1.0, volume: 0, normalize_loudness: true },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`Fish Audio error ${res.status}: ${body.slice(0, 300)}`);
    err.status = res.status === 401 || res.status === 402 ? res.status : 502;
    throw err;
  }

  const ab = await res.arrayBuffer();
  const buffer = Buffer.from(ab);

  if (cache.size >= MAX_CACHE) {
    const first = cache.keys().next().value;
    cache.delete(first);
  }
  cache.set(key, buffer);

  return { buffer, cached: false, key };
}

export { DEFAULT_VOICE, hashText };

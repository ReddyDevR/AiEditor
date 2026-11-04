const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let stderr = '';
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error(stderr || `${command} exited ${code}`)));
  });
}

async function sampleFrames(videoPath, duration, folder) {
  fs.mkdirSync(folder, { recursive: true });
  const count = Math.min(8, Math.max(3, Math.ceil(duration / 20)));
  const frames = [];
  for (let i = 0; i < count; i++) {
    const at = Math.max(0, Math.min(duration - 0.2, duration * ((i + 0.5) / count)));
    const output = path.join(folder, `frame-${i}.jpg`);
    await run(process.env.FFMPEG_PATH || 'ffmpeg', ['-y', '-ss', String(at), '-i', videoPath, '-frames:v', '1', '-vf', 'scale=640:-1', '-q:v', '5', output]);
    frames.push({ path: output, time: Number(at.toFixed(2)), data: fs.readFileSync(output).toString('base64') });
  }
  return frames;
}

function parseJson(text) {
  const cleaned = String(text || '').replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('AI returned an invalid editing plan.');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function askGemini(prompt, frames, metadata) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const parts = [{ text: `You are an autonomous professional video editor. Analyze the user request, video metadata and sampled chronological frames. Return ONLY valid JSON with keys: summary (string), aspectRatio ("9:16"|"16:9"|"1:1"), resolution ("1080p"|"4k"), operations (array), subtitles (array). Allowed operations: {"type":"TRIM_TIMELINE","position":"start"|"end","duration":number}, {"type":"APPLY_COLOR_GRADE","preset":"teal_orange"|"moody_warm"|"natural"|"cinematic"}, {"type":"SET_ASPECT_RATIO","aspectRatio":"9:16"|"16:9"|"1:1"}. Do not invent speech, subtitles, dialogue or background music from silent sampled frames. Make conservative edits; preserve important content. User request: ${prompt}. Metadata: ${JSON.stringify(metadata)}. Frame timestamps are included with each image.` }];
  frames.forEach(frame => parts.push({ text: `Frame at ${frame.time} seconds` }, { inline_data: { mime_type: 'image/jpeg', data: frame.data } }));
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_MODEL || 'gemini-3.8-flash')}:generateContent?key=${encodeURIComponent(key)}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  })
});
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || `Gemini API error ${response.status}`);
  return parseJson(payload.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n'));
}

async function askClaude(prompt, frames, metadata) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const content = [{ type: 'text', text: `Act as an autonomous professional video editor. Analyze the user request and sampled video frames. Return ONLY JSON with summary, aspectRatio (9:16|16:9|1:1), resolution (1080p|4k), operations and subtitles. Allowed operations: TRIM_TIMELINE with position start/end and duration; APPLY_COLOR_GRADE preset teal_orange/moody_warm/natural/cinematic; SET_ASPECT_RATIO. Do not invent speech, subtitles, dialogue or background music from sampled frames. Preserve important content. User request: ${prompt}. Metadata: ${JSON.stringify(metadata)}. Frame timestamps are provided.` }];
  frames.forEach(f => content.push({ type: 'text', text: `Frame at ${f.time} seconds` }, { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: f.data } }));
  const response = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929', max_tokens: 1800, temperature: 0.2, messages: [{ role: 'user', content }] }) });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || `Anthropic API error ${response.status}`);
  return parseJson(payload.content?.filter(c => c.type === 'text').map(c => c.text).join('\n'));
}

function normalizePlan(plan, prompt, metadata) {
  const allowed = new Set(['TRIM_TIMELINE', 'APPLY_COLOR_GRADE', 'SET_ASPECT_RATIO']);
  const operations = (Array.isArray(plan.operations) ? plan.operations : []).filter(op => allowed.has(op.type)).map(op => {
    if (op.type === 'TRIM_TIMELINE') return { type: op.type, position: op.position === 'end' ? 'end' : 'start', duration: Math.max(0, Math.min(metadata.duration - 1, Number(op.duration) || 0)) };
    if (op.type === 'APPLY_COLOR_GRADE') return { type: op.type, preset: ({ teal_orange: 'teal_orange', moody_warm: 'moody_warm', natural: 'clean_vibrant', cinematic: 'teal_orange' })[op.preset] || 'clean_vibrant' };
    if (op.type === 'SET_ASPECT_RATIO') return { type: op.type, aspectRatio: ['9:16','16:9','1:1'].includes(op.aspectRatio) ? op.aspectRatio : '9:16' };
    if (op.type === 'APPLY_SPEED_EFFECT') return { type: op.type, speedFactor: Math.max(0.5, Math.min(2, Number(op.speedFactor) || 1)) };
    return { type: op.type };
  });
  const ratio = ['9:16','16:9','1:1'].includes(plan.aspectRatio) ? plan.aspectRatio : (/youtube|landscape|16:9/i.test(prompt) ? '16:9' : /square|1:1/i.test(prompt) ? '1:1' : '9:16');
  if (!operations.some(op => op.type === 'SET_ASPECT_RATIO')) operations.push({ type: 'SET_ASPECT_RATIO', aspectRatio: ratio });
  if (!operations.some(op => op.type === 'APPLY_COLOR_GRADE')) operations.push({ type: 'APPLY_COLOR_GRADE', preset: 'natural' });
  const subtitles = []; // No fabricated captions: speech transcription must be integrated before subtitle burn-in.
  return { summary: String(plan.summary || 'AI analysis complete. Automatic professional finishing applied.'), aspectRatio: ratio, resolution: plan.resolution === '4k' ? '4k' : '1080p', operations, subtitles };
}

async function createAutonomousPlan(videoPath, prompt, metadata, tempDir) {
  const frames = await sampleFrames(
    videoPath,
    metadata.duration,
    tempDir
  );

  let plan = null;
  let provider = null;
  let geminiError = null;

  // First try Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      plan = await askGemini(prompt, frames, metadata);
      if (plan) provider = 'gemini';
    } catch (error) {
      geminiError = error;
      console.error('Gemini failed:', error.message);
    }
  }

  // Automatically switch to Claude if Gemini fails
  if (!plan && process.env.ANTHROPIC_API_KEY) {
    try {
      console.log('Switching to Claude AI...');
      plan = await askClaude(prompt, frames, metadata);

      if (plan) provider = 'claude';
    } catch (error) {
      console.error('Claude failed:', error.message);
      throw new Error(
        `Both AI providers failed. Gemini: ${
          geminiError?.message || 'Unavailable'
        }. Claude: ${error.message}`
      );
    }
  }

  if (!plan) {
    throw new Error(
      'No AI provider available. Configure GEMINI_API_KEY or ANTHROPIC_API_KEY.'
    );
  }

  return {
    ...normalizePlan(plan, prompt, metadata),
    provider
  };
}
module.exports = { createAutonomousPlan };

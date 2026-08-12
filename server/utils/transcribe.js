// utils/transcribe.js
const OpenAI = require('openai');
const fs = require('fs');

// Hosted speech-to-text via Groq — OpenAI-compatible endpoint running
// whisper-large-v3-turbo. Fast and has a solid free tier, good fit for a
// basic version. No ffmpeg conversion needed: Groq (like OpenAI) accepts
// webm directly.
//
// To use OpenAI's own Whisper API instead, this is the only bit that
// changes: baseURL: 'https://api.openai.com/v1', and OPENAI_API_KEY.
const groq = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

async function transcribeAudio(filePath) {
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3-turbo',
    });

    fs.unlinkSync(filePath);
    return transcription.text;
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new Error('Transcription failed: ' + err.message);
  }
}

module.exports = { transcribeAudio };

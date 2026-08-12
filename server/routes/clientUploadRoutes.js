const express = require('express');
const multer = require('multer');
const { transcribeAudio } = require('../utils/transcribe');
const { getProblemSummary, fetchLeetCodeProblem } = require('../utils/getProblemSummary');
const router = express.Router();
const OpenAI = require("openai");

// multer's default `dest` option saves files with no extension, which
// breaks format detection on the transcription API — give it a .webm name.
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.webm`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    console.log("Req Recieved");
    let userText = req.body.text || '';
    if (req.file) {
      const transcript = await transcribeAudio(req.file.path);
      userText = transcript || userText;
    }
    const slug = req.body.slug;
    if (!slug) return res.status(401).json({ msg: "Problem Slug not provided" });
    if (!userText) {
      return res.status(400).json({ error: 'No audio or text provided.' });
    }

    // 1. Get problem summary
    const summary = await getProblemSummary(slug);

    // 2-4. Recent conversation history + vector-DB context — deferred, per
    // the repo's TODO (needs Redis + KNN work). Basic version skips these
    // and sends just the problem summary + this turn's message.
    const prompt = buildPrompt(summary, [], [], userText);

    // 5. Ask the LLM
    const reply = await askDeepSeek(prompt);

    return res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

function buildPrompt(summary, recentConvo, relevantSummaries, userMessage) {
  let prompt = `${summary}\n\nRecent Conversation:\n`;
  recentConvo.forEach(turn => {
    prompt += `[${turn.role}] ${turn.message}\n`;
  });
  if (relevantSummaries.length > 0) {
    prompt += `\nPreviously Discussed (Similar):\n`;
    relevantSummaries.forEach((sum, i) => {
      prompt += `Summary ${i + 1}: ${sum}\n`;
    });
  }
  prompt += `\nUser Query:\n${userMessage}\n\nPlease provide your feedback, hints, or code suggestions.`;
  return prompt;
}

async function askDeepSeek(prompt) {
  const completion = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are an AI coach helping a student work through a LeetCode problem out loud. Be concise. Give hints and Socratic nudges before full solutions unless they explicitly ask for the answer or code.'
      },
      { role: 'user', content: prompt }
    ],
  });
  return completion.choices[0].message.content;
}

module.exports = router;

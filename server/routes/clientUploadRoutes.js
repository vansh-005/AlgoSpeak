const express = require('express');
const multer = require('multer');
const { transcribeAudio } = require('../utils/transcribe'); 
const {getProblemSummary,fetchLeetCodeProblem} = require('../utils/getProblemSummary')
const axios = require('axios');
const router = express.Router();
const OpenAI =  require("openai");
const redisClient = require('../redis/redisClient');
const maxNumberOfFullConversations = 8;


const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    console.log("Req Recieved");
    let userText = req.body.text || '';
    if (req.file) {
      const transcript = await transcribeAudio(req.file.path);
      userText = transcript || userText;
    }
    const slug = req.body.slug;
    if(!slug) return res.res.status(401).json({ msg: "Problem Slug not provided",error: err.message });
    // If no text (and no audio produced text), return error
    if (!userText) {
      return res.status(400).json({ error: 'No audio or text provided.' });
    }
    // Ok so lets start building our perfect prompt here: 
    
    // 1. Get problem summary --this part is done.
    const summary = await getProblemSummary(slug);

    // 2. Get last N full conversations
    // const recentConvo = await getRecentConversation(userId, slug);

    // // 3. Get top K most similar summaries from vector DB
    // const relevantSummaries = await getRelevantSummaries(userId, slug, userText, 4);

    // // 4. Build prompt/context
    // const prompt = buildPrompt(summary, recentConvo, relevantSummaries, userText);

    // // 5. Ask DeepSeek
    // const reply = await askDeepSeek(prompt);

    // // 6. Store this turn in Redis
    // await addConversation(userId, slug, { role: "user", message: userText });
    // await addConversation(userId, slug, { role: "assistant", message: reply });

    // 7. Summarize and vectorize if needed (exceeds N)
    // (Add this logic as a background job or here)



    // For now, just echo the resulting text (later, plug in AI/processing)
    return res.json({ reply: userText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function addConversation(userId, slug, message) {
  const key = `lc:${userId}:${slug}:recent`;
  await redisClient.rpush(key, JSON.stringify(message));
  // Trim to last N messages
  await redisClient.ltrim(key, -maxNumberOfFullConversations, -1);
}

async function getRecentConversation(userId, slug) {
  const key = `lc:${userId}:${slug}:recent`;
  const messages = await redisClient.lrange(key, 0, -1);
  return messages.map(msg => JSON.parse(msg));
}


// Assume embedText and vectorDbQuery are your embedding & vector db helpers

async function getRelevantSummaries(userId, slug, userMessage, k = 4) {
  const embedding = await embedText(userMessage); // Call DeepSeek Embedding API
  const topSummaries = await vectorDbQuery({ userId, slug, embedding, topK: k });
  return topSummaries.map(s => s.summary);
}


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
  const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey : process.env.DEEPSEEK_API_KEY
  })
}


module.exports = router;
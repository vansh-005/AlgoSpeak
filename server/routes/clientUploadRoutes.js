const express = require('express');
const multer = require('multer');
const { transcribeAudio } = require('../utils/transcribe'); 

const router = express.Router();

const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', upload.single('audio'), async (req, res) => {
  try {
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
    // For now, just echo the resulting text (later, plug in AI/processing)
    return res.json({ reply: userText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
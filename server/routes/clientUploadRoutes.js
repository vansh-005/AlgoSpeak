const express = require('express');
const multer = require('multer');
const { transcribeAudio } = require('../utils/transcribe'); 

const router = express.Router();

const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    // console.log(req);
    let userText = req.body.text || '';
    //     console.log("REQ FILE", req.file);
    // console.log("REQ BODY", req.body);
    // console.log("TEXT FIELD:", req.body.text);

     // If there is audio, transcribe it
    if (req.file) {
      const transcript = await transcribeAudio(req.file.path);
      userText = transcript || userText;
    //   console.log(userText);
    }
    
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
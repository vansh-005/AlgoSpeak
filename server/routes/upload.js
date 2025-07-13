const express = require('express');
const multer = require('multer');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const authMiddleware = require('../middleware/auth');
const uploadProtection = require('../middleware/uploadProtection');

ffmpeg.setFfmpegPath(ffmpegPath);

const router = express.Router();

const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

// --- Protected audio upload route ---
router.post('/upload', uploadProtection, upload.single('audio'), async (req, res) => {
  const webmPath = req.file.path;
  const wavPath = webmPath + '.wav';

  try {
    // Convert to WAV
    await new Promise((resolve, reject) => {
      ffmpeg(webmPath)
        .toFormat('wav')
        .on('end', resolve)
        .on('error', reject)
        .save(wavPath);
    });

    // Send to Whisper server
    const formData = new FormData();
    formData.append('audio_file', fs.createReadStream(wavPath));

    const whisperRes = await axios.post('http://localhost:8080/inference', formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity
    });

    // Cleanup
    fs.unlinkSync(webmPath);
    fs.unlinkSync(wavPath);

    res.json({ transcript: whisperRes.data.text || whisperRes.data });
  } catch (err) {
    if (fs.existsSync(webmPath)) fs.unlinkSync(webmPath);
    if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
    res.status(500).json({ error: 'Transcription failed: ' + err.message });
  }
});

// --- (Optional) Download endpoint (with backend secret protection) ---
router.get('/uploads/:filename', uploadProtection, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '..', 'uploads', filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router;

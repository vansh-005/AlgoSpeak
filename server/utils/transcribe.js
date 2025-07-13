// utils/transcribe.js
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

ffmpeg.setFfmpegPath(ffmpegPath);

async function transcribeAudio(webmPath) {
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
    formData.append('file', fs.createReadStream(wavPath));
    const whisperRes = await axios.post('http://localhost:8080/inference', formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity
    });

    // Cleanup
    fs.unlinkSync(webmPath);
    fs.unlinkSync(wavPath);
    const text = whisperRes.data.text || whisperRes.data;
    // console.log(text);
    return whisperRes.data.text || whisperRes.data;
  } catch (err) {
    if (fs.existsSync(webmPath)) fs.unlinkSync(webmPath);
    if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
    throw new Error('Transcription failed: ' + err.message);
  }
}

module.exports = { transcribeAudio };

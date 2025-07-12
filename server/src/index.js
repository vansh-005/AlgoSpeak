const express = require('express');
const multer = require('multer');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const cors = require('cors');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

// Currently for uploads i am not using any biasing but in future i intented to do that by intial prompt feature of whisper model based on problem metadata and some additional context
// formData.append('audio_file', fs.createReadStream('user_audio.wav'));
// formData.append('prompt', "LeetCode, subarray sum equals K, prefix sum, hash map, cumulative sum, O(n), target sum, array, integers");


app.post('/api/upload', upload.single('audio'), (req, res) => {
    const webmPath = req.file.path;
    const wavPath = webmPath + '.wav';

    // Convert webm to wav
    ffmpeg(webmPath)
        .toFormat('wav')
        .on('end', async () => {
            try {
                // Prepare form data to send to whisper-server
                const formData = new FormData();
                formData.append('file', fs.createReadStream(wavPath));

                // Send POST request to whisper-server (default: localhost:8080)
                const whisperRes = await axios.post('http://localhost:8080/inference', formData, {
                    headers: formData.getHeaders(),
                    maxBodyLength: Infinity
                });
                // console.log("Success");
                // const text = whisperRes.data.text || whisperRes.data;
                // console.log(text);
                // Cleanup temp files
                fs.unlinkSync(webmPath);
                fs.unlinkSync(wavPath);

                res.json({ transcript: whisperRes.data.text || whisperRes.data });
            } catch (err) {
                console.log("Failed");
                fs.unlinkSync(webmPath);
                if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
                res.status(500).json({ error: err.message });
            }
        })
        .on('error', (err) => {
            fs.unlinkSync(webmPath);
            console.log("Transcription failed");
            res.status(500).json({ error: 'Audio conversion failed: ' + err.message });
        })
        .save(wavPath);
});

app.listen(5000, () => console.log('Express server started on http://localhost:5000'));

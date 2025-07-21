require('dotenv').config();
const express = require('express');
const multer = require('multer');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const authMiddleware = require('../middleware/auth.js');
const authRoutes = require('../routes/auth');
const clientUploadRoutes = require('../routes/clientUploadRoutes.js')
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(express.json());
app.use(helmet());

app.use(cors({
  origin: [
    "http://localhost:3000", 
    "jpegdcjffepjnbjpmlgkneghhfangebp",
    "http://localhost:3000",
    "https://leetcode.com",

  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type']
}));

app.use(cookieParser());

// Routes

app.use('/api/auth', authRoutes);

app.use('/api/client-upload', authMiddleware, clientUploadRoutes);


// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(5000, () => console.log('Express server started on http://localhost:5000'));

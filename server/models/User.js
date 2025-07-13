const mongoose = require('mongoose');

const ProblemStatsSchema = new mongoose.Schema({
  problemSlug: String,
  attempts: Number,
  approaches: [String],
  lastError: String,
  solved: Boolean,
  firstTry: Date,
  lastTry: Date
});

const UserSchema = new mongoose.Schema({
  username:   { type: String, unique: true, required: true },
  email:      { type: String, unique: true, required: true },
  password:   { type: String, required: true }, // store as hash!
  refreshTokens: [{ type: String }], // store multiple, for multiple devices
  problemStats: [ProblemStatsSchema]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

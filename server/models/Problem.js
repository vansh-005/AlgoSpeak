const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  slug:        { type: String, required: true, unique: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  constraints: { type: String },
  exampleTestcases: { type: String },
  cachedSummary: { type: String },
  lastFetched:  { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Problem', ProblemSchema);

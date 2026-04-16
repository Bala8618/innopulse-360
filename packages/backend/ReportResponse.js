const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['rating', 'single-select', 'multi-select', 'text'], default: 'text' },
  value: mongoose.Schema.Types.Mixed
}, { _id: false });

const reportResponseSchema = new mongoose.Schema({
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'ReportTemplate', required: true, index: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  answers: [answerSchema],
  suggestion: String
}, { timestamps: true });

reportResponseSchema.index({ template: 1, participant: 1 }, { unique: true });

module.exports = mongoose.model('ReportResponse', reportResponseSchema);

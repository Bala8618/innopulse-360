const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['rating', 'single-select', 'multi-select', 'text'], default: 'rating' },
  options: [String],
  required: { type: Boolean, default: true }
}, { _id: false });

const reportTemplateSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  isActive: { type: Boolean, default: true, index: true },
  questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.model('ReportTemplate', reportTemplateSchema);

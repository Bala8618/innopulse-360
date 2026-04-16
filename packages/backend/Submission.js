const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  prototypeUrl: { type: String, required: true },
  repoUrl: String,
  deckUrl: String,
  completionPercent: { type: Number, min: 0, max: 100, default: 0 },
  status: { type: String, enum: ['draft', 'submitted', 'resubmitted'], default: 'draft', index: true }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);

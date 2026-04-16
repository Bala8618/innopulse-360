const mongoose = require('mongoose');

const shortlistSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  shortlistedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  remarks: String,
  status: { type: String, enum: ['shortlisted', 'waitlisted', 'rejected'], default: 'shortlisted', index: true }
}, { timestamps: true });

shortlistSchema.index({ event: 1, team: 1 }, { unique: true });

module.exports = mongoose.model('Shortlist', shortlistSchema);

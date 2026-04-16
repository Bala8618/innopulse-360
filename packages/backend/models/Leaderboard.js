const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  score: { type: Number, min: 0, max: 100, required: true, index: true },
  rank: { type: Number, min: 1, required: true, index: true },
  snapshotDate: { type: Date, default: Date.now }
}, { timestamps: true });

leaderboardSchema.index({ event: 1, rank: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);

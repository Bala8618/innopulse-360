const mongoose = require('mongoose');

const winningProjectSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  rank: { type: Number, min: 1, required: true },
  prize: { type: String, required: true },
  declaredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  declarationDate: { type: Date, default: Date.now }
}, { timestamps: true });

winningProjectSchema.index({ event: 1, rank: 1 }, { unique: true });

module.exports = mongoose.model('WinningProject', winningProjectSchema);

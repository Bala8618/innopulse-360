const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  domain: { type: String, required: true, index: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  juryPanel: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'shortlisted', 'rejected', 'winner'], default: 'active' }
}, { timestamps: true });

teamSchema.index({ event: 1, domain: 1 });

module.exports = mongoose.model('Team', teamSchema);

const mongoose = require('mongoose');

const mentorSessionSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  assignedSessions: { type: Number, min: 0, default: 1 },
  conductedSessions: { type: Number, min: 0, default: 0 },
  mentorScore: { type: Number, min: 0, max: 100, default: 0 },
  notes: String,
  sessionDate: Date
}, { timestamps: true });

mentorSessionSchema.index({ mentor: 1, team: 1, event: 1 });

module.exports = mongoose.model('MentorSession', mentorSessionSchema);

const mongoose = require('mongoose');

const performanceReportSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', index: true },
  IPI: { type: Number, min: 0, max: 100, default: 0 },
  teamInnovationScore: { type: Number, min: 0, max: 100, default: 0 },
  mentorEngagementRate: { type: Number, min: 0, max: 1, default: 0 },
  juryCompletionRate: { type: Number, min: 0, max: 1, default: 0 },
  travelHospitalityEfficiency: { type: Number, min: 0, max: 1, default: 0 },
  eventOperationalEfficiency: { type: Number, min: 0, max: 1, default: 0 },
  eventRating: { type: Number, min: 1, max: 5 },
  participantFeedback: String,
  wouldRecommend: Boolean,
  submittedAt: Date
}, { timestamps: true });

performanceReportSchema.index({ event: 1, user: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('PerformanceReport', performanceReportSchema);

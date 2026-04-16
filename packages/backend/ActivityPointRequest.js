const mongoose = require('mongoose');

const activityPointRequestSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', index: true },
  pointsRequested: { type: Number, min: 1, required: true },
  summary: { type: String, required: true },
  proofUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  reviewRemark: String,
  reviewedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

activityPointRequestSchema.index({ event: 1, user: 1, status: 1 });

module.exports = mongoose.model('ActivityPointRequest', activityPointRequestSchema);

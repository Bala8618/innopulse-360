const mongoose = require('mongoose');

const mentorApprovalSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', index: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requestType: { type: String, enum: ['mentor-approval', 'od-approval'], default: 'mentor-approval' },
  reason: { type: String, required: true },
  proofUrl: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  reviewRemark: String,
  reviewedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

mentorApprovalSchema.index({ event: 1, user: 1, mentor: 1, requestType: 1 });

module.exports = mongoose.model('MentorApproval', mentorApprovalSchema);

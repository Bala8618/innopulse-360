const mongoose = require('mongoose');

const domainAnalyticsSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  domain: { type: String, required: true, index: true },
  averageScore: { type: Number, min: 0, max: 100, default: 0 },
  teamCount: { type: Number, min: 0, default: 0 },
  updatedAtSnapshot: { type: Date, default: Date.now }
}, { timestamps: true });

domainAnalyticsSchema.index({ event: 1, domain: 1 }, { unique: true });

module.exports = mongoose.model('DomainAnalytics', domainAnalyticsSchema);

const mongoose = require('mongoose');

const travelRequestSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  sourceCity: { type: String, required: true },
  destinationCity: { type: String, required: true },
  mode: { type: String, enum: ['flight', 'train', 'bus', 'cab'], required: true },
  amount: { type: Number, min: 0, required: true },
  isFree: { type: Boolean, default: false },
  costConfigured: { type: Number, min: 0, default: 0 },
  managementRemark: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

travelRequestSchema.index({ event: 1, status: 1 });

module.exports = mongoose.model('TravelRequest', travelRequestSchema);

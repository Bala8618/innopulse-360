const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  hotelName: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  roomType: { type: String, enum: ['single', 'double', 'triple'], default: 'double' },
  isFree: { type: Boolean, default: false },
  costConfigured: { type: Number, min: 0, default: 0 },
  managementRemark: String,
  status: { type: String, enum: ['pending', 'allocated', 'rejected'], default: 'pending', index: true }
}, { timestamps: true });

module.exports = mongoose.model('Accommodation', accommodationSchema);

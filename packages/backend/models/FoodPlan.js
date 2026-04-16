const mongoose = require('mongoose');

const foodPlanSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  preference: { type: String, enum: ['veg', 'non-veg', 'vegan', 'jain'], default: 'veg' },
  allergies: [String],
  mealSlots: [{ type: String, enum: ['breakfast', 'lunch', 'snacks', 'dinner'] }],
  isFree: { type: Boolean, default: false },
  costConfigured: { type: Number, min: 0, default: 0 },
  managementRemark: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true }
}, { timestamps: true });

module.exports = mongoose.model('FoodPlan', foodPlanSchema);

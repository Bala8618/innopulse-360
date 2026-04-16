const mongoose = require('mongoose');

const juryEvaluationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  jury: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
  assignedEvaluations: { type: Number, min: 0, default: 1 },
  completedEvaluations: { type: Number, min: 0, default: 0 },
  criteria: {
    novelty: { type: Number, min: 0, max: 100, default: 0 },
    feasibility: { type: Number, min: 0, max: 100, default: 0 },
    impact: { type: Number, min: 0, max: 100, default: 0 },
    scalability: { type: Number, min: 0, max: 100, default: 0 }
  },
  totalScore: { type: Number, min: 0, max: 100, default: 0 },
  feedback: String,
  status: { type: String, enum: ['pending', 'completed'], default: 'pending', index: true }
}, { timestamps: true });

juryEvaluationSchema.pre('save', function calcTotal(next) {
  const { novelty, feasibility, impact, scalability } = this.criteria;
  this.totalScore = (novelty + feasibility + impact + scalability) / 4;
  next();
});

module.exports = mongoose.model('JuryEvaluation', juryEvaluationSchema);

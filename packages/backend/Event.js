const mongoose = require('mongoose');

function generateEventCode() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `EVT-${ts}-${rand}`;
}

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  eventCode: { type: String, unique: true, index: true, uppercase: true },
  organizer: { type: String, required: true },
  description: String,
  eventType: { type: String, enum: ['individual', 'team', 'hybrid'], default: 'team', index: true },
  minTeamSize: { type: Number, min: 1, default: 1 },
  maxTeamSize: { type: Number, min: 1, default: 5 },
  prizePool: { type: Number, min: 0, default: 0 },
  prizeDetails: String,
  workflowNotes: String,
  registrationStartDate: Date,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: Date,
  rounds: [{
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    notes: String
  }],
  status: { type: String, enum: ['draft', 'open', 'shortlisting', 'live', 'completed'], default: 'draft', index: true },
  domains: [{ type: String, required: true }]
}, { timestamps: true });

eventSchema.pre('validate', function assignEventCode(next) {
  if (!this.eventCode) {
    this.eventCode = generateEventCode();
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);

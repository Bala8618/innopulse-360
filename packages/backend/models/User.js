const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: {
    type: String,
    enum: ['participant', 'mentor', 'admin', 'event_management', 'college_management', 'reports_team'],
    required: true,
    index: true
  },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, select: false },
  otpExpiresAt: { type: Date, select: false },
  resetToken: { type: String, select: false },
  resetTokenExpiresAt: { type: Date, select: false },
  profile: {
    phone: String,
    institution: String,
    designation: String,
    skills: [String]
  },
  lastLoginAt: Date,
  status: { type: String, enum: ['active', 'blocked'], default: 'active' }
}, { timestamps: true });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);

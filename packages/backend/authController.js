const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');

function setAuthCookie(res, token) {
  res.cookie(process.env.COOKIE_NAME || 'innopulse_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

async function logActivity(req, userId, action, entity, entityId) {
  if (!process.env.MONGO_URI) return;
  await ActivityLog.create({
    user: userId,
    action,
    entity,
    entityId,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
}

const fallbackUsers = [
  { id: 'adm-1', name: 'Admin', email: 'admin@test.com', role: 'admin', password: bcrypt.hashSync('Bala@0301', 10), isVerified: true },
  { id: 'evt-1', name: 'Event Team', email: 'event@test.com', role: 'event_management', password: bcrypt.hashSync('Bala@0301', 10), isVerified: true },
  { id: 'par-1', name: 'Participant', email: 'participant@test.com', role: 'participant', password: bcrypt.hashSync('Bala@0301', 10), isVerified: true },
  { id: 'men-1', name: 'Mentor', email: 'mentor@test.com', role: 'mentor', password: bcrypt.hashSync('Bala@0301', 10), isVerified: true },
  { id: 'col-1', name: 'College Team', email: 'college@test.com', role: 'college_management', password: bcrypt.hashSync('Bala@0301', 10), isVerified: true },
  { id: 'rep-1', name: 'Reports Team', email: 'reports@test.com', role: 'reports_team', password: bcrypt.hashSync('Bala@0301', 10), isVerified: true }
];

async function findUserByEmail(email) {
  if (!process.env.MONGO_URI) {
    return fallbackUsers.find((u) => u.email === email) || null;
  }
  return User.findOne({ email }).select('+password');
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const allowedRoles = ['participant', 'mentor', 'admin', 'event_management', 'college_management', 'reports_team'];

  if (!allowedRoles.includes(role)) {
    throw new ApiError(422, 'Role is not enabled');
  }

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already registered');

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({ name, email, password, role, otp, otpExpiresAt });

  let emailSent = true;
  try {
    await sendEmail({
      to: email,
      subject: 'InnoPulse 360 OTP Verification',
      text: `Your OTP is ${otp}. Valid for 10 minutes.`
    });
  } catch (error) {
    emailSent = false;
  }

  await logActivity(req, user._id, 'REGISTER', 'User', user._id);

  if (!emailSent && process.env.NODE_ENV !== 'production') {
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    return res.status(201).json({
      message: 'Registered and auto-verified (SMTP not configured in development). You can login now.',
      devOtp: otp
    });
  }

  res.status(201).json({ message: 'Registered successfully. Verify OTP.' });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email }).select('+otp +otpExpiresAt');
  if (!user) throw new ApiError(404, 'User not found');

  if (user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  await logActivity(req, user._id, 'VERIFY_OTP', 'User', user._id);

  res.json({ message: 'Account verified successfully' });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) throw new ApiError(401, 'Invalid credentials');
  if (user.isVerified === false) throw new ApiError(403, 'Verify account using OTP');

  const matched = user.comparePassword ? await user.comparePassword(password) : await bcrypt.compare(password, user.password);
  if (!matched) throw new ApiError(401, 'Invalid credentials');

  const allowedRoles = ['participant', 'mentor', 'admin', 'event_management', 'college_management', 'reports_team'];
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError(403, 'Role is not enabled');
  }

  const token = signToken({ id: user._id || user.id, role: user.role });
  setAuthCookie(res, token);

  if (user.save) {
    user.lastLoginAt = new Date();
    await user.save();
  }

  await logActivity(req, user._id || user.id, 'LOGIN', 'User', user._id || user.id);

  const redirectMap = {
    participant: '/portal/participant',
    mentor: '/portal/mentor',
    admin: '/admin-innopulse-control',
    event_management: '/portal/event-management',
    college_management: '/portal/college-management',
    reports_team: '/portal/reports-team'
  };

  res.json({
    message: 'Login successful',
    user: { id: user._id || user.id, name: user.name, email: user.email, role: user.role },
    redirectTo: redirectMap[user.role]
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: 'If email exists, reset link has been sent' });

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

  try {
    await sendEmail({
      to: email,
      subject: 'InnoPulse 360 Password Reset',
      text: `Reset your password using this link: ${resetUrl}`
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        message: 'SMTP not configured. Use dev reset URL from response.',
        devResetUrl: resetUrl
      });
    }
    throw error;
  }

  await logActivity(req, user._id, 'FORGOT_PASSWORD', 'User', user._id);

  res.json({ message: 'If email exists, reset link has been sent' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetToken: hashed,
    resetTokenExpiresAt: { $gt: new Date() }
  }).select('+password +resetToken +resetTokenExpiresAt');

  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpiresAt = undefined;
  await user.save();

  await logActivity(req, user._id, 'RESET_PASSWORD', 'User', user._id);

  res.json({ message: 'Password reset successful' });
});

exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME || 'innopulse_token');
  res.json({ message: 'Logged out' });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

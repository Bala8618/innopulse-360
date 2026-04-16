const asyncHandler = require('../utils/asyncHandler');
const Team = require('../models/Team');
const MentorSession = require('../models/MentorSession');
const MentorApproval = require('../models/MentorApproval');

exports.getOverview = asyncHandler(async (req, res) => {
  const assignedTeams = await Team.find({ mentor: req.user._id }).select('name domain status');
  const sessions = await MentorSession.find({ mentor: req.user._id }).sort({ createdAt: -1 }).limit(20);

  res.json({
    message: 'Mentor dashboard data',
    data: { assignedTeams, sessions }
  });
});

exports.getAssignedTeams = asyncHandler(async (req, res) => {
  const data = await Team.find({ mentor: req.user._id }).select('name domain status members').populate('members', 'name email');
  res.json({ data });
});

exports.getSessionLogs = asyncHandler(async (req, res) => {
  const data = await MentorSession.find({ mentor: req.user._id }).populate('team', 'name domain').sort({ createdAt: -1 });
  res.json({ data });
});

exports.getApprovalRequests = asyncHandler(async (req, res) => {
  const data = await MentorApproval.find({ mentor: req.user._id })
    .populate('user', 'name email')
    .populate('event', 'title eventCode')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.updateApprovalStatus = asyncHandler(async (req, res) => {
  const { status, reviewRemark } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(422).json({ message: 'Invalid approval status' });
  }

  const data = await MentorApproval.findOneAndUpdate(
    { _id: req.params.id, mentor: req.user._id },
    {
      status,
      reviewRemark: reviewRemark || '',
      reviewedAt: new Date(),
      reviewedBy: req.user._id
    },
    { new: true }
  );

  if (!data) return res.status(404).json({ message: 'Approval request not found' });
  res.json({ message: `Request ${status}`, data });
});

const asyncHandler = require('../utils/asyncHandler');
const RewardClaim = require('../models/RewardClaim');
const ActivityPointRequest = require('../models/ActivityPointRequest');

exports.getOverview = asyncHandler(async (_, res) => {
  const [rewardClaimsPending, activityPointsPending] = await Promise.all([
    RewardClaim.countDocuments({ status: 'pending' }),
    ActivityPointRequest.countDocuments({ status: 'pending' })
  ]);
  res.json({ data: { rewardClaimsPending, activityPointsPending } });
});

exports.rewardClaimList = asyncHandler(async (_, res) => {
  const data = await RewardClaim.find()
    .populate('winner', 'rank prize')
    .populate('event', 'title eventCode')
    .populate('team', 'name')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.updateRewardClaimStatus = asyncHandler(async (req, res) => {
  const { status, reviewRemark } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(422).json({ message: 'Invalid reward claim status' });
  }
  const data = await RewardClaim.findByIdAndUpdate(
    req.params.id,
    { status, reviewRemark: reviewRemark || '', reviewedBy: req.user._id, reviewedAt: new Date() },
    { new: true }
  );
  if (!data) return res.status(404).json({ message: 'Reward claim not found' });
  res.json({ message: `Reward claim ${status}`, data });
});

exports.activityPointList = asyncHandler(async (_, res) => {
  const data = await ActivityPointRequest.find()
    .populate('event', 'title eventCode')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.updateActivityPointStatus = asyncHandler(async (req, res) => {
  const { status, reviewRemark } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(422).json({ message: 'Invalid activity points status' });
  }
  const data = await ActivityPointRequest.findByIdAndUpdate(
    req.params.id,
    { status, reviewRemark: reviewRemark || '', reviewedAt: new Date(), reviewedBy: req.user._id },
    { new: true }
  );
  if (!data) return res.status(404).json({ message: 'Activity points request not found' });
  res.json({ message: `Activity points ${status}`, data });
});

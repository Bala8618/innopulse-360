const asyncHandler = require('../utils/asyncHandler');
const TravelRequest = require('../models/TravelRequest');
const Accommodation = require('../models/Accommodation');
const FoodPlan = require('../models/FoodPlan');

exports.getOverview = asyncHandler(async (_, res) => {
  const [travelPending, accommodationPending, foodPending] = await Promise.all([
    TravelRequest.countDocuments({ status: 'pending' }),
    Accommodation.countDocuments({ status: 'pending' }),
    FoodPlan.countDocuments({ status: 'pending' })
  ]);
  res.json({ data: { travelPending, accommodationPending, foodPending } });
});

exports.travelList = asyncHandler(async (_, res) => {
  const data = await TravelRequest.find()
    .populate('user', 'name email')
    .populate('event', 'title eventCode')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.updateTravelStatus = asyncHandler(async (req, res) => {
  const { status, isFree, costConfigured, managementRemark } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(422).json({ message: 'Invalid status' });
  }
  const data = await TravelRequest.findByIdAndUpdate(
    req.params.id,
    { status, isFree: Boolean(isFree), costConfigured: Number(costConfigured || 0), managementRemark },
    { new: true }
  );
  if (!data) return res.status(404).json({ message: 'Travel request not found' });
  res.json({ message: `Travel ${status}`, data });
});

exports.accommodationList = asyncHandler(async (_, res) => {
  const data = await Accommodation.find()
    .populate('user', 'name email')
    .populate('event', 'title eventCode')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.updateAccommodationStatus = asyncHandler(async (req, res) => {
  const { status, isFree, costConfigured, managementRemark } = req.body;
  if (!['allocated', 'rejected', 'pending'].includes(status)) {
    return res.status(422).json({ message: 'Invalid status' });
  }
  const data = await Accommodation.findByIdAndUpdate(
    req.params.id,
    { status, isFree: Boolean(isFree), costConfigured: Number(costConfigured || 0), managementRemark },
    { new: true }
  );
  if (!data) return res.status(404).json({ message: 'Accommodation request not found' });
  res.json({ message: `Accommodation ${status}`, data });
});

exports.foodList = asyncHandler(async (_, res) => {
  const data = await FoodPlan.find()
    .populate('user', 'name email')
    .populate('event', 'title eventCode')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.updateFoodStatus = asyncHandler(async (req, res) => {
  const { status, isFree, costConfigured, managementRemark } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(422).json({ message: 'Invalid status' });
  }
  const data = await FoodPlan.findByIdAndUpdate(
    req.params.id,
    { status, isFree: Boolean(isFree), costConfigured: Number(costConfigured || 0), managementRemark },
    { new: true }
  );
  if (!data) return res.status(404).json({ message: 'Food request not found' });
  res.json({ message: `Food ${status}`, data });
});

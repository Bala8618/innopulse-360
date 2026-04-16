const asyncHandler = require('../utils/asyncHandler');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Shortlist = require('../models/Shortlist');
const TravelRequest = require('../models/TravelRequest');
const Accommodation = require('../models/Accommodation');
const FoodPlan = require('../models/FoodPlan');
const Team = require('../models/Team');
const JuryEvaluation = require('../models/JuryEvaluation');
const WinningProject = require('../models/WinningProject');
const ActivityLog = require('../models/ActivityLog');
const MentorSession = require('../models/MentorSession');
const Submission = require('../models/Submission');
const Leaderboard = require('../models/Leaderboard');
const DomainAnalytics = require('../models/DomainAnalytics');
const PerformanceReport = require('../models/PerformanceReport');
const Notification = require('../models/Notification');
const User = require('../models/User');
const MentorApproval = require('../models/MentorApproval');
const ActivityPointRequest = require('../models/ActivityPointRequest');
const RewardClaim = require('../models/RewardClaim');
const mongoose = require('mongoose');
const eventLifecycleService = require('../services/eventLifecycleService');

function toSlug(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildRounds(body) {
  const rounds = [];
  if (body.round1StartDate && body.round1EndDate) {
    rounds.push({
      name: body.round1Name || 'Round 1',
      startDate: body.round1StartDate,
      endDate: body.round1EndDate,
      notes: body.round1Notes || ''
    });
  }
  if (body.round2StartDate && body.round2EndDate) {
    rounds.push({
      name: body.round2Name || 'Round 2',
      startDate: body.round2StartDate,
      endDate: body.round2EndDate,
      notes: body.round2Notes || ''
    });
  }
  return rounds;
}

function asDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function asNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function validateEventTimeline({ registrationStartDate, registrationDeadline, startDate, endDate, rounds = [] }) {
  const regStart = asDate(registrationStartDate);
  const regEnd = asDate(registrationDeadline);
  const eventStart = asDate(startDate);
  const eventEnd = asDate(endDate);

  if (!eventStart || !eventEnd) return 'Event start date and end date are required and must be valid dates';
  if (eventStart > eventEnd) return 'Event end date must be after start date';

  if (regStart && regEnd && regStart > regEnd) return 'Registration end date must be after registration start date';
  if (regStart && regStart > eventStart) return 'Registration start date must be on or before event start date';
  if (regEnd && regEnd > eventStart) return 'Registration end date must be on or before event start date';

  const normalizedRounds = (rounds || []).map((round) => ({
    name: round.name,
    startDate: asDate(round.startDate),
    endDate: asDate(round.endDate)
  }));

  for (const round of normalizedRounds) {
    if (!round.startDate || !round.endDate) {
      return `Round ${round.name || ''} must have valid start and end dates`;
    }
    if (round.startDate > round.endDate) {
      return `Round ${round.name || ''} end date must be after start date`;
    }
    if (round.startDate < eventStart || round.endDate > eventEnd) {
      return `Round ${round.name || ''} dates must be inside event window`;
    }
  }

  const sortedRounds = normalizedRounds.slice().sort((a, b) => a.startDate - b.startDate);
  for (let i = 1; i < sortedRounds.length; i += 1) {
    if (sortedRounds[i].startDate < sortedRounds[i - 1].endDate) {
      return 'Round dates cannot overlap';
    }
  }

  return null;
}

function validateEventMode(payload) {
  const eventType = payload.eventType || 'team';
  const minTeamSize = asNumber(payload.minTeamSize, 1);
  const maxTeamSize = asNumber(payload.maxTeamSize, 5);

  if (eventType === 'individual') {
    if (minTeamSize !== 1 || maxTeamSize !== 1) return 'Individual events must have team size 1';
  }
  if (minTeamSize < 1 || maxTeamSize < 1 || minTeamSize > maxTeamSize) {
    return 'Invalid team size configuration';
  }
  return null;
}

exports.getOverview = asyncHandler(async (_, res) => {
  const [events, registrations, shortlisted, travel, accommodations, foodPlans, teams, evaluations, winners] = await Promise.all([
    Event.countDocuments(),
    Registration.countDocuments(),
    Shortlist.countDocuments({ status: 'shortlisted' }),
    TravelRequest.countDocuments({ status: 'approved' }),
    Accommodation.countDocuments({ status: 'allocated' }),
    FoodPlan.countDocuments({ status: 'approved' }),
    Team.countDocuments(),
    JuryEvaluation.countDocuments({ status: 'completed' }),
    WinningProject.countDocuments()
  ]);

  res.json({
    message: 'Admin overview',
    data: { events, registrations, shortlisted, travel, accommodations, foodPlans, teams, evaluations, winners }
  });
});

exports.createEvent = asyncHandler(async (req, res) => {
  const baseSlug = toSlug(req.body.slug || req.body.title || 'event');
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const domains = Array.isArray(req.body.domains)
    ? req.body.domains
    : String(req.body.domains || '')
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

  const payload = {
    ...req.body,
    slug,
    eventType: req.body.eventType || 'team',
    minTeamSize: asNumber(req.body.minTeamSize, 1),
    maxTeamSize: asNumber(req.body.maxTeamSize, 5),
    prizePool: asNumber(req.body.prizePool, 0),
    domains,
    rounds: buildRounds(req.body)
  };

  const timelineError = validateEventTimeline(payload);
  if (timelineError) return res.status(422).json({ message: timelineError });
  const modeError = validateEventMode(payload);
  if (modeError) return res.status(422).json({ message: modeError });

  const event = await eventLifecycleService.createEvent(payload);
  res.status(201).json({ message: 'Event created', data: event });
});

exports.updateEvent = asyncHandler(async (req, res) => {
  const existing = await Event.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Event not found' });

  const domains = Array.isArray(req.body.domains)
    ? req.body.domains
    : String(req.body.domains || '')
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
  const hasRoundFields = ['round1StartDate', 'round1EndDate', 'round2StartDate', 'round2EndDate', 'round1Name', 'round2Name']
    .some((field) => Object.prototype.hasOwnProperty.call(req.body, field));

  const payload = {
    ...req.body,
    eventType: req.body.eventType || existing.eventType,
    minTeamSize: asNumber(req.body.minTeamSize, existing.minTeamSize || 1),
    maxTeamSize: asNumber(req.body.maxTeamSize, existing.maxTeamSize || 5),
    prizePool: asNumber(req.body.prizePool, existing.prizePool || 0),
    rounds: hasRoundFields ? buildRounds(req.body) : existing.rounds
  };

  if (domains.length) payload.domains = domains;
  if (!payload.rounds.length) delete payload.rounds;

  const timelineError = validateEventTimeline({
    registrationStartDate: payload.registrationStartDate ?? existing.registrationStartDate,
    registrationDeadline: payload.registrationDeadline ?? existing.registrationDeadline,
    startDate: payload.startDate ?? existing.startDate,
    endDate: payload.endDate ?? existing.endDate,
    rounds: payload.rounds ?? existing.rounds
  });
  if (timelineError) return res.status(422).json({ message: timelineError });
  const modeError = validateEventMode({
    eventType: payload.eventType ?? existing.eventType,
    minTeamSize: payload.minTeamSize ?? existing.minTeamSize,
    maxTeamSize: payload.maxTeamSize ?? existing.maxTeamSize
  });
  if (modeError) return res.status(422).json({ message: modeError });

  const data = await Event.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  res.json({ message: 'Event updated', data });
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const data = await Event.findByIdAndDelete(req.params.id);
  if (!data) return res.status(404).json({ message: 'Event not found' });
  res.json({ message: 'Event deleted' });
});

exports.shortlistTeam = asyncHandler(async (req, res) => {
  const payload = {
    event: req.body.event,
    team: req.body.team,
    shortlistedBy: req.user._id,
    remarks: req.body.remarks,
    status: req.body.status || 'shortlisted'
  };

  const shortlist = await eventLifecycleService.shortlistTeam(payload);
  res.json({ message: 'Shortlist updated', data: shortlist });
});

exports.approveTravel = asyncHandler(async (req, res) => {
  const result = await eventLifecycleService.approveTravelRequest(req.params.id, req.user._id);
  res.json({ message: 'Travel request approved', data: result });
});

exports.updateTravelStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(422).json({ message: 'Invalid travel status' });
  }

  const data = await TravelRequest.findByIdAndUpdate(
    req.params.id,
    { status, approvedBy: req.user._id },
    { new: true }
  );

  if (!data) return res.status(404).json({ message: 'Travel request not found' });
  res.json({ message: `Travel request ${status}`, data });
});

exports.auditLogs = asyncHandler(async (_, res) => {
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(200).populate('user', 'name email role');
  res.json({ data: logs });
});

exports.registrationList = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const filter = req.query.status ? { status: req.query.status } : {};

  const total = await Registration.countDocuments(filter);
  const data = await Registration.find(filter)
    .populate('user', 'name email')
    .populate('event', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  });
});

exports.updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(422).json({ message: 'Invalid registration status' });
  }

  const data = await Registration.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!data) return res.status(404).json({ message: 'Registration not found' });
  res.json({ message: `Registration ${status}`, data });
});

exports.bulkApproveRegistrations = asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  if (!validIds.length) return res.status(422).json({ message: 'Provide valid registration ids' });

  const result = await Registration.updateMany(
    { _id: { $in: validIds }, status: { $ne: 'approved' } },
    { $set: { status: 'approved' } }
  );

  res.json({
    message: 'Bulk approval completed',
    data: { matched: result.matchedCount, updated: result.modifiedCount }
  });
});

exports.allocateAccommodation = asyncHandler(async (req, res) => {
  const item = await Accommodation.create(req.body);
  res.status(201).json({ message: 'Accommodation allocated', data: item });
});

exports.allocateFood = asyncHandler(async (req, res) => {
  const item = await FoodPlan.create(req.body);
  res.status(201).json({ message: 'Food plan allocated', data: item });
});

exports.assignMentor = asyncHandler(async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.body.teamId, { mentor: req.body.mentorId }, { new: true });
  if (!team) return res.status(404).json({ message: 'Team not found' });

  await MentorSession.create({
    event: req.body.eventId,
    mentor: req.body.mentorId,
    team: req.body.teamId,
    assignedSessions: req.body.assignedSessions || 1
  });

  res.json({ message: 'Mentor assigned', data: team });
});

exports.assignJury = asyncHandler(async (req, res) => {
  const team = await Team.findByIdAndUpdate(
    req.body.teamId,
    { $addToSet: { juryPanel: { $each: req.body.juryIds || [] } } },
    { new: true }
  );
  if (!team) return res.status(404).json({ message: 'Team not found' });
  res.json({ message: 'Jury assigned', data: team });
});

exports.recordEvaluation = asyncHandler(async (req, res) => {
  const item = await JuryEvaluation.create(req.body);
  res.status(201).json({ message: 'Evaluation recorded', data: item });
});

exports.declareWinner = asyncHandler(async (req, res) => {
  const winner = await WinningProject.create({
    event: req.body.event,
    team: req.body.team,
    rank: req.body.rank,
    prize: req.body.prize,
    declaredBy: req.user._id
  });

  await Team.findByIdAndUpdate(req.body.team, { status: 'winner' });
  res.status(201).json({ message: 'Winner declared', data: winner });
});

exports.updateWinner = asyncHandler(async (req, res) => {
  const payload = {};
  if (req.body.rank !== undefined) payload.rank = req.body.rank;
  if (req.body.prize !== undefined) payload.prize = req.body.prize;
  if (req.body.team !== undefined) payload.team = req.body.team;
  if (req.body.event !== undefined) payload.event = req.body.event;

  const data = await WinningProject.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!data) return res.status(404).json({ message: 'Winner not found' });
  res.json({ message: 'Winner updated', data });
});

exports.deleteWinner = asyncHandler(async (req, res) => {
  const winner = await WinningProject.findByIdAndDelete(req.params.id);
  if (!winner) return res.status(404).json({ message: 'Winner not found' });
  await RewardClaim.deleteMany({ winner: winner._id });
  res.json({ message: 'Winner deleted' });
});

exports.eventList = asyncHandler(async (_, res) => {
  const data = await Event.find().sort({ createdAt: -1 });
  res.json({ data });
});

exports.shortlistList = asyncHandler(async (_, res) => {
  const data = await Shortlist.find().populate('team', 'name domain status').populate('event', 'title').sort({ createdAt: -1 });
  res.json({ data });
});

exports.teamList = asyncHandler(async (_, res) => {
  const data = await Team.find()
    .populate('mentor', 'name email')
    .populate('members', 'name email')
    .populate('event', 'title')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.travelList = asyncHandler(async (_, res) => {
  const data = await TravelRequest.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ data });
});

exports.accommodationList = asyncHandler(async (_, res) => {
  const data = await Accommodation.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ data });
});

exports.foodList = asyncHandler(async (_, res) => {
  const data = await FoodPlan.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ data });
});

exports.mentorSessionsList = asyncHandler(async (_, res) => {
  const data = await MentorSession.find().populate('mentor', 'name email').populate('team', 'name').sort({ createdAt: -1 });
  res.json({ data });
});

exports.juryEvaluationsList = asyncHandler(async (_, res) => {
  const data = await JuryEvaluation.find().populate('jury', 'name email').populate('team', 'name').sort({ createdAt: -1 });
  res.json({ data });
});

exports.submissionList = asyncHandler(async (_, res) => {
  const data = await Submission.find().populate('participant', 'name email').populate('team', 'name').sort({ createdAt: -1 });
  res.json({ data });
});

exports.domainAnalyticsList = asyncHandler(async (_, res) => {
  const data = await DomainAnalytics.find().sort({ updatedAt: -1 });
  res.json({ data });
});

exports.leaderboardList = asyncHandler(async (_, res) => {
  const data = await Leaderboard.find().populate('team', 'name domain').sort({ rank: 1, createdAt: -1 });
  res.json({ data });
});

exports.winnerList = asyncHandler(async (_, res) => {
  const data = await WinningProject.find().populate('team', 'name domain').populate('event', 'title').sort({ rank: 1, createdAt: -1 });
  res.json({ data });
});

exports.reportList = asyncHandler(async (_, res) => {
  const data = await PerformanceReport.find()
    .populate('team', 'name domain')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.eventRankingList = asyncHandler(async (_, res) => {
  const data = await PerformanceReport.aggregate([
    { $match: { eventRating: { $gte: 1, $lte: 5 } } },
    {
      $group: {
        _id: '$event',
        averageRating: { $avg: '$eventRating' },
        feedbackCount: { $sum: 1 },
        recommendCount: { $sum: { $cond: ['$wouldRecommend', 1, 0] } }
      }
    },
    {
      $addFields: {
        recommendRate: {
          $cond: [{ $gt: ['$feedbackCount', 0] }, { $divide: ['$recommendCount', '$feedbackCount'] }, 0]
        }
      }
    },
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: '_id',
        as: 'event'
      }
    },
    { $unwind: '$event' },
    {
      $project: {
        _id: 0,
        eventId: '$_id',
        eventTitle: '$event.title',
        eventCode: '$event.eventCode',
        averageRating: { $round: ['$averageRating', 2] },
        feedbackCount: 1,
        recommendRate: { $round: [{ $multiply: ['$recommendRate', 100] }, 2] },
        weightedScore: {
          $round: [
            {
              $add: [
                { $multiply: [{ $divide: ['$averageRating', 5] }, 70] },
                { $multiply: ['$recommendRate', 30] }
              ]
            },
            2
          ]
        }
      }
    },
    { $sort: { weightedScore: -1, averageRating: -1, feedbackCount: -1 } }
  ]);

  res.json({ data });
});

exports.userList = asyncHandler(async (_, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const data = await User.find()
    .select('-password -otp -otpExpiresAt -resetToken -resetTokenExpiresAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  });
});

exports.notificationList = asyncHandler(async (_, res) => {
  const data = await Notification.find().populate('recipient', 'name email role').sort({ createdAt: -1 }).limit(300);
  res.json({ data });
});

exports.mentorApprovalList = asyncHandler(async (_, res) => {
  const data = await MentorApproval.find()
    .populate('event', 'title eventCode')
    .populate('user', 'name email')
    .populate('mentor', 'name email')
    .sort({ createdAt: -1 });
  res.json({ data });
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
    return res.status(422).json({ message: 'Invalid activity point status' });
  }

  const data = await ActivityPointRequest.findByIdAndUpdate(
    req.params.id,
    {
      status,
      reviewRemark: reviewRemark || '',
      reviewedAt: new Date(),
      reviewedBy: req.user._id
    },
    { new: true }
  );
  if (!data) return res.status(404).json({ message: 'Activity point request not found' });
  res.json({ message: `Activity point request ${status}`, data });
});

exports.mentorUserList = asyncHandler(async (_, res) => {
  const data = await User.find({ role: 'mentor', status: 'active' }).select('name email role');
  res.json({ data });
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
    {
      status,
      reviewRemark: reviewRemark || '',
      reviewedBy: req.user._id,
      reviewedAt: new Date()
    },
    { new: true }
  );
  if (!data) return res.status(404).json({ message: 'Reward claim not found' });
  res.json({ message: `Reward claim ${status}`, data });
});

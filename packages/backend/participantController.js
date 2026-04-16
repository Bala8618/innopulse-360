const asyncHandler = require('../utils/asyncHandler');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const Notification = require('../models/Notification');
const TravelRequest = require('../models/TravelRequest');
const Accommodation = require('../models/Accommodation');
const FoodPlan = require('../models/FoodPlan');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const PerformanceReport = require('../models/PerformanceReport');
const MentorApproval = require('../models/MentorApproval');const { sendNotification } = require('../services/notificationService');const ActivityPointRequest = require('../models/ActivityPointRequest');
const WinningProject = require('../models/WinningProject');
const RewardClaim = require('../models/RewardClaim');
const ReportTemplate = require('../models/ReportTemplate');
const ReportResponse = require('../models/ReportResponse');
const User = require('../models/User');
const mongoose = require('mongoose');

async function resolveEventId(input) {
  if (!input) return null;
  if (mongoose.Types.ObjectId.isValid(input)) return input;

  const event = await Event.findOne({ eventCode: String(input).toUpperCase() }).select('_id');
  return event?._id || null;
}

exports.getOverview = asyncHandler(async (req, res) => {
  const teams = await Team.find({ members: req.user._id }).select('name domain status');
  const submissions = await Submission.find({ participant: req.user._id }).select('title completionPercent status');
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(10);

  res.json({
    message: 'Participant dashboard data',
    data: { teams, submissions, notifications }
  });
});

exports.listSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ participant: req.user._id }).sort({ createdAt: -1 });
  res.json({ data: submissions });
});

exports.createSubmission = asyncHandler(async (req, res) => {
  // Middleware ensures approved registration and team assignment
  const { registration, event } = req;

  const submission = await Submission.create({
    ...req.body,
    team: registration.team._id,
    event: event._id,
    participant: req.user._id,
    status: 'submitted'
  });

  await sendNotification(req.app.locals.io, req.user._id, 'Submission Created', 'Your submission has been successfully created.', 'success');

  res.status(201).json({ message: 'Submission created', data: submission });
});

exports.listTravelRequests = asyncHandler(async (req, res) => {
  const items = await TravelRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ data: items });
});

exports.createTravelRequest = asyncHandler(async (req, res) => {
  // Middleware: requireApprovedRegistration, requireMentorApproval, ensureTeamAssignment
  const { registration, event } = req;

  const item = await TravelRequest.create({
    ...req.body,
    event: event._id,
    team: registration.team._id,
    user: req.user._id,
    status: 'pending'
  });

  res.status(201).json({ message: 'Travel request created', data: item });
});

exports.listAccommodationRequests = asyncHandler(async (req, res) => {
  const items = await Accommodation.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ data: items });
});

exports.createAccommodationRequest = asyncHandler(async (req, res) => {
  // Middleware: requireApprovedRegistration, requireMentorApproval, ensureTeamAssignment
  const { registration, event } = req;

  const data = await Accommodation.create({
    event: event._id,
    user: req.user._id,
    team: registration.team._id,
    hotelName: req.body.hotelName,
    checkIn: req.body.checkIn,
    checkOut: req.body.checkOut,
    roomType: req.body.roomType || 'double',
    status: 'pending'
  });
  res.status(201).json({ message: 'Accommodation request submitted', data });
});

exports.listFoodRequests = asyncHandler(async (req, res) => {
  const items = await FoodPlan.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ data: items });
});

exports.createFoodRequest = asyncHandler(async (req, res) => {
  // Middleware: requireApprovedRegistration, requireMentorApproval, ensureTeamAssignment
  const { registration, event } = req;

  const data = await FoodPlan.create({
    event: event._id,
    user: req.user._id,
    team: registration.team._id,
    preference: req.body.preference || 'veg',
    allergies: Array.isArray(req.body.allergies) ? req.body.allergies : [],
    mealSlots: Array.isArray(req.body.mealSlots) ? req.body.mealSlots : ['lunch', 'dinner'],
    status: 'pending'
  });
  res.status(201).json({ message: 'Food request submitted', data });
});

exports.listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ data: notifications });
});

exports.listAvailableEvents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const missingCodeEvents = await Event.find({ $or: [{ eventCode: { $exists: false } }, { eventCode: '' }] }).select('_id');
  if (missingCodeEvents.length) {
    // Trigger schema pre-validate hook to generate missing event codes.
    // Save sequentially to preserve unique-index safety under low concurrency.
    for (const event of missingCodeEvents) {
      const doc = await Event.findById(event._id);
      if (doc && !doc.eventCode) await doc.save();
    }
  }

  const registrations = await Registration.find({
    user: req.user._id,
    status: 'approved'
  }).select('event');
  const eventIds = registrations.map((r) => r.event);

  const filter = {
    _id: { $in: eventIds },
    status: { $in: ['open', 'live', 'shortlisting', 'completed'] }
  };

  const total = await Event.countDocuments(filter);
  const data = await Event.find({
    _id: { $in: eventIds },
    status: { $in: ['open', 'live', 'shortlisting', 'completed'] }
  })
    .select('title eventCode startDate endDate status organizer eventType minTeamSize maxTeamSize prizePool prizeDetails registrationStartDate registrationDeadline rounds workflowNotes domains')
    .sort({ startDate: -1 })
    .skip(skip)
    .limit(limit);
  res.json({ data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
});

exports.listOpenRegistrationEvents = asyncHandler(async (req, res) => {
  const now = new Date();
  const data = await Event.find({
    status: { $in: ['open', 'live'] },
    $and: [
      {
        $or: [
          { registrationStartDate: { $exists: false } },
          { registrationStartDate: null },
          { registrationStartDate: { $lte: now } }
        ]
      },
      {
        $or: [
          { registrationDeadline: { $exists: false } },
          { registrationDeadline: null },
          { registrationDeadline: { $gte: now } }
        ]
      }
    ]
  }).select('title eventCode status organizer startDate endDate registrationStartDate registrationDeadline eventType minTeamSize maxTeamSize prizePool prizeDetails rounds workflowNotes domains');

  const existing = await Registration.find({ user: req.user._id }).select('event status');
  const map = new Map(existing.map((r) => [String(r.event), r.status]));
  const decorated = data.map((e) => ({
    ...e.toObject(),
    registrationStatus: map.get(String(e._id)) || null
  }));

  res.json({ data: decorated });
});

exports.listRegistrations = asyncHandler(async (req, res) => {
  const data = await Registration.find({ user: req.user._id })
    .populate('event', 'title eventCode status registrationDeadline registrationStartDate startDate endDate eventType minTeamSize maxTeamSize rounds prizePool prizeDetails workflowNotes')
    .populate('team', 'name domain')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.createRegistration = asyncHandler(async (req, res) => {
  const eventId = await resolveEventId(req.body.event);
  if (!eventId) {
    return res.status(422).json({ message: 'Invalid event code' });
  }
  const event = await Event.findById(eventId).select('registrationStartDate registrationDeadline status eventType');
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const now = new Date();
  if (event.status !== 'open' && event.status !== 'live') {
    return res.status(403).json({ message: 'Event is not open for registration' });
  }
  if (event.registrationStartDate && event.registrationStartDate > now) {
    return res.status(403).json({ message: 'Registration window has not started yet' });
  }
  if (event.registrationDeadline && event.registrationDeadline < now) {
    return res.status(403).json({ message: 'Registration window has ended' });
  }

  const payload = {
    event: eventId,
    user: req.user._id,
    ideaTitle: req.body.ideaTitle,
    ideaSummary: req.body.ideaSummary,
    domain: req.body.domain,
    teamPreferenceName: req.body.teamPreferenceName || '',
    teamMembersInput: Array.isArray(req.body.teamMembersInput) ? req.body.teamMembersInput : [],
    status: 'pending'
  };

  let data = await Registration.findOneAndUpdate(
    { event: eventId, user: req.user._id },
    payload,
    { upsert: true, new: true, runValidators: true }
  );

  res.status(201).json({ message: 'Registered for event', data });
});

exports.listReports = asyncHandler(async (req, res) => {
  const data = await PerformanceReport.find({ user: req.user._id })
    .populate('event', 'title eventCode status')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.submitReport = asyncHandler(async (req, res) => {
  // Middleware: requireApprovedRegistration, ensureTeamAssignment
  const { registration, event: eventFromReq } = req;
  const eventDetails = await Event.findById(eventFromReq._id).select('endDate status');
  if (!eventDetails) return res.status(404).json({ message: 'Event not found' });

  const now = new Date();
  const completed = eventDetails.status === 'completed' || (eventDetails.endDate && eventDetails.endDate <= now);
  if (!completed) {
    return res.status(403).json({ message: 'Report submission opens after event completion' });
  }

  const payload = {
    event: eventFromReq._id,
    user: req.user._id,
    team: registration.team._id,
    eventRating: req.body.eventRating,
    participantFeedback: req.body.participantFeedback,
    wouldRecommend: req.body.wouldRecommend,
    submittedAt: now
  };

  const data = await PerformanceReport.findOneAndUpdate(
    { event: eventFromReq._id, user: req.user._id },
    payload,
    { upsert: true, new: true, runValidators: true }
  );

  res.status(201).json({ message: 'Report submitted', data });
});

exports.listMentorApprovals = asyncHandler(async (req, res) => {
  const data = await MentorApproval.find({ user: req.user._id })
    .populate('event', 'title eventCode')
    .populate('mentor', 'name email')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.createMentorApproval = asyncHandler(async (req, res) => {
  // Middleware: requireApprovedRegistration, ensureTeamAssignment
  const { registration, event } = req;

  let mentor = null;
  if (req.body.mentorId && mongoose.Types.ObjectId.isValid(req.body.mentorId)) {
    mentor = await User.findById(req.body.mentorId).select('_id role');
  } else if (req.body.mentorEmail) {
    mentor = await User.findOne({ email: String(req.body.mentorEmail).toLowerCase() }).select('_id role');
  }
  if (!mentor || mentor.role !== 'mentor') {
    return res.status(422).json({ message: 'Valid mentor is required. Use mentor email or mentor id.' });
  }

  const data = await MentorApproval.findOneAndUpdate(
    { event: event._id, user: req.user._id, mentor: mentor._id },
    {
    event: event._id,
    user: req.user._id,
    team: registration.team,
    mentor: mentor._id,
    requestType: req.body.requestType || 'mentor-approval',
    reason: req.body.reason,
    proofUrl: req.body.proofUrl || '',
    status: 'pending'
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(201).json({ message: 'Mentor approval request submitted', data });
});

exports.listActivityPointRequests = asyncHandler(async (req, res) => {
  const data = await ActivityPointRequest.find({ user: req.user._id })
    .populate('event', 'title eventCode')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.createActivityPointRequest = asyncHandler(async (req, res) => {
  // Middleware: requireApprovedRegistration, requireMentorApproval, ensureTeamAssignment
  const { registration, event } = req;

  const pointsRequested = Number(req.body.pointsRequested);
  if (!Number.isFinite(pointsRequested) || pointsRequested < 1) {
    return res.status(422).json({ message: 'Valid pointsRequested is required' });
  }

  const data = await ActivityPointRequest.create({
    event: event._id,
    user: req.user._id,
    team: registration.team._id,
    pointsRequested,
    summary: req.body.summary,
    proofUrl: req.body.proofUrl,
    status: 'pending'
  });

  res.status(201).json({ message: 'Activity points request submitted', data });
});

exports.listMentors = asyncHandler(async (_, res) => {
  const data = await User.find({ role: 'mentor', status: 'active' }).select('name email role');
  res.json({ data });
});

exports.listActiveReportTemplates = asyncHandler(async (req, res) => {
  const data = await ReportTemplate.find({ isActive: true })
    .populate('event', 'title eventCode')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.submitReportResponse = asyncHandler(async (req, res) => {
  const template = await ReportTemplate.findById(req.body.templateId).select('event title');
  if (!template) return res.status(404).json({ message: 'Report template not found' });

  const registration = await Registration.findOne({
    user: req.user._id,
    event: template.event,
    status: 'approved'
  }).select('_id');
  if (!registration) {
    return res.status(403).json({ message: 'You can submit response only for your approved event registration' });
  }

  const data = await ReportResponse.findOneAndUpdate(
    { template: template._id, participant: req.user._id },
    {
      template: template._id,
      event: template.event,
      participant: req.user._id,
      answers: Array.isArray(req.body.answers) ? req.body.answers : [],
      suggestion: req.body.suggestion || ''
    },
    { upsert: true, new: true, runValidators: true }
  );
  res.status(201).json({ message: 'Report response submitted', data });
});

exports.listWinners = asyncHandler(async (req, res) => {
  const teams = await Team.find({ members: req.user._id }).select('_id');
  const teamIds = teams.map((team) => team._id);
  const data = await WinningProject.find({ team: { $in: teamIds } })
    .populate('event', 'title eventCode')
    .populate('team', 'name domain')
    .sort({ declarationDate: -1 });
  res.json({ data });
});

exports.listRewardClaims = asyncHandler(async (req, res) => {
  const data = await RewardClaim.find({ user: req.user._id })
    .populate('winner', 'rank prize')
    .populate('event', 'title eventCode')
    .populate('team', 'name')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.createRewardClaim = asyncHandler(async (req, res) => {
  const winnerId = req.body.winnerId;
  if (!winnerId || !mongoose.Types.ObjectId.isValid(winnerId)) {
    return res.status(422).json({ message: 'Valid winnerId is required' });
  }

  const winner = await WinningProject.findById(winnerId).populate('team', 'members');
  if (!winner) return res.status(404).json({ message: 'Winning record not found' });

  const isMember = winner.team?.members?.some((member) => String(member) === String(req.user._id));
  if (!isMember) {
    return res.status(403).json({ message: 'You can claim rewards only for your winning team' });
  }
  if (!req.body.proofUrl) {
    return res.status(422).json({ message: 'Proof URL is required' });
  }

  const data = await RewardClaim.findOneAndUpdate(
    { winner: winner._id, user: req.user._id },
    {
      winner: winner._id,
      event: winner.event,
      team: winner.team._id,
      user: req.user._id,
      proofUrl: req.body.proofUrl,
      remarks: req.body.remarks || '',
      status: 'pending'
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(201).json({ message: 'Reward claim submitted', data });
});

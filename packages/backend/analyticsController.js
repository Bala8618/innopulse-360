const asyncHandler = require('../utils/asyncHandler');
const analyticsService = require('../services/analyticsService');
const Team = require('../models/Team');
const ApiError = require('../utils/ApiError');

exports.getEventAnalytics = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const [teamInnovation, domainPerformance, mentorEngagement, juryCompletion, travelEfficiency, eventEfficiency] = await Promise.all([
    analyticsService.calculateTeamInnovationScore(eventId),
    analyticsService.calculateDomainPerformanceScore(eventId),
    analyticsService.calculateMentorEngagementRate(eventId),
    analyticsService.calculateJuryCompletionRate(eventId),
    analyticsService.calculateTravelHospitalityEfficiency(eventId),
    analyticsService.calculateEventOperationalEfficiency(eventId)
  ]);

  res.json({
    message: 'Event analytics generated',
    data: {
      teamInnovation,
      domainPerformance,
      mentorEngagement,
      juryCompletion,
      travelEfficiency,
      eventEfficiency
    }
  });
});

exports.getIndividualIPI = asyncHandler(async (req, res) => {
  const { userId, teamId } = req.params;

  if (req.user.role === 'participant') {
    if (String(req.user._id) !== String(userId)) {
      throw new ApiError(403, 'Participants can only view their own IPI');
    }

    const team = await Team.findById(teamId).select('members');
    if (!team || !team.members.some((memberId) => String(memberId) === String(req.user._id))) {
      throw new ApiError(403, 'You do not have access to this team data');
    }
  }

  const IPI = await analyticsService.calculateIndividualPerformanceIndex(userId, teamId);
  res.json({ message: 'Individual Performance Index generated', data: { IPI } });
});

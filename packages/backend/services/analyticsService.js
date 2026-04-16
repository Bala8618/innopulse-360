const mongoose = require('mongoose');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const MentorSession = require('../models/MentorSession');
const JuryEvaluation = require('../models/JuryEvaluation');
const TravelRequest = require('../models/TravelRequest');

function safeDivide(a, b) {
  return b ? a / b : 0;
}

async function calculateIndividualPerformanceIndex(userId, teamId) {
  const [mentorAgg, juryAgg, prototypeAgg] = await Promise.all([
    MentorSession.aggregate([
      { $match: { team: new mongoose.Types.ObjectId(teamId) } },
      { $group: { _id: null, mentorScore: { $avg: '$mentorScore' }, participationRate: { $avg: { $cond: [{ $gt: ['$assignedSessions', 0] }, { $divide: ['$conductedSessions', '$assignedSessions'] }, 0] } } } }
    ]),
    JuryEvaluation.aggregate([
      { $match: { team: new mongoose.Types.ObjectId(teamId) } },
      { $group: { _id: null, juryScore: { $avg: '$totalScore' } } }
    ]),
    Submission.aggregate([
      { $match: { participant: new mongoose.Types.ObjectId(userId), team: new mongoose.Types.ObjectId(teamId) } },
      { $group: { _id: null, completion: { $avg: '$completionPercent' } } }
    ])
  ]);

  const mentorScore = mentorAgg[0]?.mentorScore || 0;
  const juryScore = juryAgg[0]?.juryScore || 0;
  const prototypeCompletion = prototypeAgg[0]?.completion || 0;
  const participationRate = (mentorAgg[0]?.participationRate || 0) * 100;

  return (mentorScore + juryScore + prototypeCompletion + participationRate) / 4;
}

async function calculateTeamInnovationScore(eventId) {
  return JuryEvaluation.aggregate([
    { $match: { event: new mongoose.Types.ObjectId(eventId) } },
    { $group: { _id: '$team', teamInnovationScore: { $avg: '$totalScore' } } }
  ]);
}

async function calculateDomainPerformanceScore(eventId) {
  return Team.aggregate([
    { $match: { event: new mongoose.Types.ObjectId(eventId) } },
    {
      $lookup: {
        from: 'juryevaluations',
        localField: '_id',
        foreignField: 'team',
        as: 'evaluations'
      }
    },
    {
      $project: {
        domain: 1,
        teamScore: { $avg: '$evaluations.totalScore' }
      }
    },
    {
      $group: {
        _id: '$domain',
        domainPerformanceScore: { $avg: '$teamScore' },
        teamCount: { $sum: 1 }
      }
    }
  ]);
}

async function calculateMentorEngagementRate(eventId) {
  const agg = await MentorSession.aggregate([
    { $match: { event: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: null,
        assigned: { $sum: '$assignedSessions' },
        conducted: { $sum: '$conductedSessions' }
      }
    }
  ]);

  return safeDivide(agg[0]?.conducted || 0, agg[0]?.assigned || 0);
}

async function calculateJuryCompletionRate(eventId) {
  const agg = await JuryEvaluation.aggregate([
    { $match: { event: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: null,
        assigned: { $sum: '$assignedEvaluations' },
        completed: { $sum: '$completedEvaluations' }
      }
    }
  ]);

  return safeDivide(agg[0]?.completed || 0, agg[0]?.assigned || 0);
}

async function calculateTravelHospitalityEfficiency(eventId) {
  const agg = await TravelRequest.aggregate([
    { $match: { event: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } }
      }
    }
  ]);

  return safeDivide(agg[0]?.approved || 0, agg[0]?.total || 0);
}

async function calculateEventOperationalEfficiency(eventId) {
  const [juryCompletion, mentorCompletion, travelApproval] = await Promise.all([
    calculateJuryCompletionRate(eventId),
    calculateMentorEngagementRate(eventId),
    calculateTravelHospitalityEfficiency(eventId)
  ]);

  return (juryCompletion + mentorCompletion + travelApproval) / 3;
}

module.exports = {
  calculateIndividualPerformanceIndex,
  calculateTeamInnovationScore,
  calculateDomainPerformanceScore,
  calculateMentorEngagementRate,
  calculateJuryCompletionRate,
  calculateTravelHospitalityEfficiency,
  calculateEventOperationalEfficiency
};

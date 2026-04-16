const asyncHandler = require('../utils/asyncHandler');
const JuryEvaluation = require('../models/JuryEvaluation');
const VivaQuestion = require('../models/VivaQuestion');
const Shortlist = require('../models/Shortlist');
const WinningProject = require('../models/WinningProject');
const Team = require('../models/Team');

exports.getOverview = asyncHandler(async (req, res) => {
  const evaluations = await JuryEvaluation.find({ jury: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json({ message: 'Jury dashboard data', data: { evaluations } });
});

exports.getEvaluations = asyncHandler(async (req, res) => {
  const data = await JuryEvaluation.find({ jury: req.user._id }).populate('team', 'name domain').sort({ createdAt: -1 });
  res.json({ data });
});

exports.getVivaRecords = asyncHandler(async (req, res) => {
  const data = await VivaQuestion.find({ jury: req.user._id }).populate('team', 'name domain').sort({ createdAt: -1 });
  res.json({ data });
});

exports.shortlistTeam = asyncHandler(async (req, res) => {
  const data = await Shortlist.findOneAndUpdate(
    { event: req.body.event, team: req.body.team },
    {
      event: req.body.event,
      team: req.body.team,
      shortlistedBy: req.user._id,
      remarks: req.body.remarks || '',
      status: req.body.status || 'shortlisted'
    },
    { upsert: true, new: true, runValidators: true }
  );
  res.json({ message: 'Shortlist decision saved', data });
});

exports.declareWinner = asyncHandler(async (req, res) => {
  const data = await WinningProject.create({
    event: req.body.event,
    team: req.body.team,
    rank: req.body.rank,
    prize: req.body.prize,
    declaredBy: req.user._id
  });
  await Team.findByIdAndUpdate(req.body.team, { status: 'winner' });
  res.status(201).json({ message: 'Winner declared by jury', data });
});

const asyncHandler = require('../utils/asyncHandler');
const Event = require('../models/Event');
const ReportTemplate = require('../models/ReportTemplate');
const ReportResponse = require('../models/ReportResponse');

exports.getOverview = asyncHandler(async (_, res) => {
  const [templates, responses] = await Promise.all([
    ReportTemplate.countDocuments(),
    ReportResponse.countDocuments()
  ]);
  res.json({ data: { templates, responses } });
});

exports.createTemplate = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.body.event);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  const data = await ReportTemplate.create({
    event: event._id,
    createdBy: req.user._id,
    title: req.body.title,
    description: req.body.description || '',
    isActive: req.body.isActive !== false,
    questions: Array.isArray(req.body.questions) ? req.body.questions : []
  });
  res.status(201).json({ message: 'Report template created', data });
});

exports.listTemplates = asyncHandler(async (_, res) => {
  const data = await ReportTemplate.find()
    .populate('event', 'title eventCode')
    .sort({ createdAt: -1 });
  res.json({ data });
});

exports.listResponses = asyncHandler(async (_, res) => {
  const data = await ReportResponse.find()
    .populate('event', 'title eventCode')
    .populate('participant', 'name email')
    .populate('template', 'title')
    .sort({ createdAt: -1 });
  res.json({ data });
});

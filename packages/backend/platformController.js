const asyncHandler = require('../utils/asyncHandler');
const platformStore = require('../services/platformStore');

exports.listEvents = asyncHandler(async (req, res) => {
  const data = platformStore.listEvents(req.query);
  res.json({ data });
});

exports.getEventDetails = asyncHandler(async (req, res) => {
  const payload = platformStore.getEventDetails(req.params.event_id);
  if (!payload) return res.status(404).json({ message: 'Event not found' });
  res.json(payload);
});

exports.registerParticipant = asyncHandler(async (req, res) => {
  const required = ['student_name', 'college_name', 'department', 'year', 'email', 'phone', 'team_name', 'team_members', 'event_id'];
  const missing = required.filter((f) => !req.body[f]);
  if (missing.length) return res.status(422).json({ message: `Missing fields: ${missing.join(', ')}` });
  const row = platformStore.registerParticipant(req.body);
  res.status(201).json({ message: 'Registered successfully', data: row });
});

exports.getMyRegistrations = asyncHandler(async (req, res) => {
  if (!req.query.email) return res.status(422).json({ message: 'email is required' });
  res.json({ data: platformStore.getRegistrationsByEmail(req.query.email) });
});

exports.getLogistics = asyncHandler(async (req, res) => {
  const payload = platformStore.getLogistics(req.params.event_id);
  if (!payload) return res.status(404).json({ message: 'Event not found' });
  res.json(payload);
});

exports.createRequest = asyncHandler(async (req, res) => {
  const required = ['event_id', 'participant_id', 'type'];
  const missing = required.filter((f) => !req.body[f]);
  if (missing.length) return res.status(422).json({ message: `Missing fields: ${missing.join(', ')}` });
  const row = platformStore.createEventRequest(req.body);
  res.status(201).json({ message: 'Request submitted', data: row });
});

exports.listRequests = asyncHandler(async (req, res) => {
  res.json({ data: platformStore.listEventRequests(req.query) });
});

exports.updateRequest = asyncHandler(async (req, res) => {
  const row = platformStore.updateEventRequest(req.params.id, req.body);
  if (!row) return res.status(404).json({ message: 'Request not found' });
  res.json({ message: 'Request updated', data: row });
});

exports.createReimbursement = asyncHandler(async (req, res) => {
  const required = ['event_id', 'participant_id', 'reimbursement_code'];
  const missing = required.filter((f) => !req.body[f]);
  if (missing.length) return res.status(422).json({ message: `Missing fields: ${missing.join(', ')}` });
  const row = platformStore.createReimbursement(req.body);
  res.status(201).json({ message: 'Reimbursement submitted', data: row });
});

exports.listReimbursements = asyncHandler(async (req, res) => {
  res.json({ data: platformStore.listReimbursements(req.query) });
});

exports.updateReimbursement = asyncHandler(async (req, res) => {
  const row = platformStore.updateReimbursement(req.params.id, req.body);
  if (!row) return res.status(404).json({ message: 'Reimbursement not found' });
  res.json({ message: 'Reimbursement updated', data: row });
});

exports.createOdRequest = asyncHandler(async (req, res) => {
  const required = ['event_id', 'participant_id', 'event_code', 'mentor_name', 'mentor_email', 'parent_email'];
  const missing = required.filter((f) => !req.body[f]);
  if (missing.length) return res.status(422).json({ message: `Missing fields: ${missing.join(', ')}` });
  const row = platformStore.createOdRequest(req.body);
  res.status(201).json({ message: 'OD request submitted', data: row });
});

exports.listOdRequests = asyncHandler(async (req, res) => {
  res.json({ data: platformStore.listOdRequests(req.query) });
});

exports.updateOdRequest = asyncHandler(async (req, res) => {
  const row = platformStore.updateOdRequest(req.params.id, req.body);
  if (!row) return res.status(404).json({ message: 'OD request not found' });
  res.json({ message: 'OD request updated', data: row });
});

exports.createReward = asyncHandler(async (req, res) => {
  const required = ['event_id', 'participant_id', 'event_name', 'result_type'];
  const missing = required.filter((f) => !req.body[f]);
  if (missing.length) return res.status(422).json({ message: `Missing fields: ${missing.join(', ')}` });
  const row = platformStore.createReward(req.body);
  res.status(201).json({ message: 'Reward submission created', data: row });
});

exports.listRewards = asyncHandler(async (req, res) => {
  res.json({ data: platformStore.listRewards(req.query) });
});

exports.updateReward = asyncHandler(async (req, res) => {
  const row = platformStore.updateReward(req.params.id, req.body);
  if (!row) return res.status(404).json({ message: 'Reward not found' });
  res.json({ message: 'Reward updated', data: row });
});

exports.submitFeedback = asyncHandler(async (req, res) => {
  const required = ['event_id', 'participant_id', 'answers', 'overall_satisfaction'];
  const missing = required.filter((f) => !req.body[f]);
  if (missing.length) return res.status(422).json({ message: `Missing fields: ${missing.join(', ')}` });
  const answers = req.body.answers || {};
  if (Object.keys(answers).length < 30) {
    return res.status(422).json({ message: 'Minimum 30 feedback answers are required' });
  }
  const row = platformStore.createFeedback(req.body);
  if (row?.error) return res.status(row.status || 422).json({ message: row.error });
  res.status(201).json({ message: 'Feedback submitted', data: row });
});

exports.feedbackQuestions = asyncHandler(async (_, res) => {
  res.json({ data: platformStore.feedbackQuestions });
});

exports.listFeedbackForms = asyncHandler(async (_, res) => {
  res.json({ data: platformStore.listFeedbackForms() });
});

exports.saveFeedbackForm = asyncHandler(async (req, res) => {
  const row = platformStore.saveFeedbackForm(req.body);
  if (!row) return res.status(422).json({ message: 'Invalid form payload' });
  res.json({ message: 'Feedback form saved', data: row });
});

exports.listFeedback = asyncHandler(async (_, res) => {
  res.json({ data: platformStore.listFeedback() });
});

exports.myFeedback = asyncHandler(async (req, res) => {
  if (!req.query.email) return res.status(422).json({ message: 'email is required' });
  res.json({ data: platformStore.getFeedbackByEmail(req.query.email) });
});

exports.feedbackAnalytics = asyncHandler(async (_, res) => {
  res.json(platformStore.getFeedbackAnalytics());
});

exports.createQuery = asyncHandler(async (req, res) => {
  const required = ['event_id', 'participant_id', 'category', 'description', 'priority'];
  const missing = required.filter((f) => !req.body[f]);
  if (missing.length) return res.status(422).json({ message: `Missing fields: ${missing.join(', ')}` });
  const row = platformStore.createQuery(req.body);
  res.status(201).json({ message: 'Query submitted', data: row });
});

exports.listQueries = asyncHandler(async (req, res) => {
  res.json({ data: platformStore.listQueries(req.query) });
});

exports.replyQuery = asyncHandler(async (req, res) => {
  const row = platformStore.replyQuery(req.params.id, req.body);
  if (!row) return res.status(404).json({ message: 'Query not found' });
  res.json({ message: 'Query replied', data: row });
});

exports.adminRaw = asyncHandler(async (req, res) => {
  const table = req.query.table;
  if (!table) return res.status(422).json({ message: 'table is required' });
  res.json({ data: platformStore.adminRaw(table) });
});

exports.adminUpdate = asyncHandler(async (req, res) => {
  const table = req.params.table;
  const row = platformStore.adminUpdate(table, req.params.id, req.body);
  if (!row) return res.status(404).json({ message: 'Row not found' });
  res.json({ message: 'Updated', data: row });
});

exports.adminDelete = asyncHandler(async (req, res) => {
  const table = req.params.table;
  const ok = platformStore.adminDelete(table, req.params.id);
  if (!ok) return res.status(404).json({ message: 'Row not found' });
  res.json({ message: 'Deleted' });
});

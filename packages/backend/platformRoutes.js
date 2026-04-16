const express = require('express');
const c = require('../controllers/platformController');

const router = express.Router();

router.get('/events', c.listEvents);
router.get('/events/:event_id/details', c.getEventDetails);
router.post('/registrations', c.registerParticipant);
router.get('/registrations/me', c.getMyRegistrations);

router.get('/logistics/:event_id', c.getLogistics);
router.post('/requests', c.createRequest);
router.get('/requests', c.listRequests);
router.put('/requests/:id', c.updateRequest);

router.post('/reimbursements', c.createReimbursement);
router.get('/reimbursements', c.listReimbursements);
router.put('/reimbursements/:id', c.updateReimbursement);

router.post('/od-requests', c.createOdRequest);
router.get('/od-requests', c.listOdRequests);
router.put('/od-requests/:id', c.updateOdRequest);

router.post('/rewards', c.createReward);
router.get('/rewards', c.listRewards);
router.put('/rewards/:id', c.updateReward);

router.get('/feedback/questions', c.feedbackQuestions);
router.get('/feedback/forms', c.listFeedbackForms);
router.post('/feedback/forms', c.saveFeedbackForm);
router.get('/feedback', c.listFeedback);
router.get('/feedback/me', c.myFeedback);
router.post('/feedback', c.submitFeedback);
router.get('/feedback/analytics', c.feedbackAnalytics);

router.post('/queries', c.createQuery);
router.get('/queries', c.listQueries);
router.put('/queries/:id/reply', c.replyQuery);

router.get('/admin/raw', c.adminRaw);
router.put('/admin/raw/:table/:id', c.adminUpdate);
router.delete('/admin/raw/:table/:id', c.adminDelete);

module.exports = router;

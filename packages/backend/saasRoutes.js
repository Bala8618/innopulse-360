const express = require('express');
const saas = require('../controllers/saasController');

const router = express.Router();

router.post('/events', saas.createEvent);
router.get('/events', saas.getEvents);
router.get('/events/:id/flow', saas.getEventFlow);
router.put('/events/:id', saas.updateEvent);
router.delete('/events/:id', saas.deleteEvent);

router.post('/participants', saas.createParticipant);
router.get('/participants', saas.getParticipants);
router.put('/participants/:id/approve', saas.approveParticipant);
router.put('/participants/:id/reject', saas.rejectParticipant);

router.get('/dashboard/stats', saas.getDashboardStats);

router.get('/event-management/:event_id', saas.getEventManagementByEvent);
router.post('/event-management', saas.createEventManagement);
router.put('/event-management/:id', saas.updateEventManagement);
router.delete('/event-management/:id', saas.deleteEventManagement);

router.get('/event-budget/:event_id', saas.getEventBudget);
router.post('/event-budget', saas.upsertEventBudget);

module.exports = router;

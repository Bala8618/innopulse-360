const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.get('/event/:eventId', auth, role('admin', 'jury', 'mentor'), analyticsController.getEventAnalytics);
router.get('/ipi/:userId/:teamId', auth, role('admin', 'mentor', 'jury', 'participant'), analyticsController.getIndividualIPI);

module.exports = router;

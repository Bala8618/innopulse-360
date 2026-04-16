const Event = require('../models/Event');
const Shortlist = require('../models/Shortlist');
const TravelRequest = require('../models/TravelRequest');

async function createEvent(payload) {
  return Event.create(payload);
}

async function shortlistTeam(payload) {
  return Shortlist.findOneAndUpdate(
    { event: payload.event, team: payload.team },
    payload,
    { upsert: true, new: true }
  );
}

async function approveTravelRequest(id, approvedBy) {
  return TravelRequest.findByIdAndUpdate(
    id,
    { status: 'approved', approvedBy },
    { new: true }
  );
}

module.exports = {
  createEvent,
  shortlistTeam,
  approveTravelRequest
};

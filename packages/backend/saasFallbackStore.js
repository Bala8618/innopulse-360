const baseDate = new Date('2026-03-06T09:00:00.000Z');

const statusByIndex = (i) => (i < 2 ? 'active' : i < 18 ? 'upcoming' : 'closed');

const events = Array.from({ length: 20 }, (_, i) => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + i * 2);
  const start = new Date(d);
  start.setHours(9, 0, 0, 0);
  const end = new Date(d);
  end.setHours(18, 0, 0, 0);
  const regStart = new Date(d);
  regStart.setDate(regStart.getDate() - 10);
  const regDeadline = new Date(d);
  regDeadline.setDate(regDeadline.getDate() - 2);
  const screening = new Date(d);
  screening.setDate(screening.getDate() - 1);
  const judging = new Date(d);
  judging.setHours(16, 0, 0, 0);
  const result = new Date(d);
  result.setDate(result.getDate() + 1);
  result.setHours(10, 0, 0, 0);

  return {
    id: i + 1,
    event_name: `InnoPulse Event ${i + 1}`,
    description: `Commercial event workflow for cohort ${i + 1}.`,
    domain: ['AI', 'IoT', 'FinTech', 'HealthTech', 'EdTech'][i % 5],
    event_type: ['Online', 'Offline', 'Hybrid'][i % 3],
    event_mode: i % 2 ? 'Team' : 'Individual',
    round_count: (i % 3) + 1,
    team_size_min: 1,
    team_size_max: 5,
    registration_start_date: regStart.toISOString(),
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    registration_deadline: regDeadline.toISOString(),
    screening_date: screening.toISOString(),
    judging_date: judging.toISOString(),
    result_date: result.toISOString(),
    organizer: 'InnoPulse 360',
    venue: i % 2 ? 'Chennai' : 'Online',
    max_participants: 200 + i * 10,
    prize_details: `Winner INR ${50000 + i * 2000}`,
    registration_fee: i % 3 === 0 ? 'Free' : `${200 + i * 20} INR`,
    problem_statement: `Solve domain problem for cohort ${i + 1} with measurable impact and scalable execution.`,
    rules: 'Original solution. Demo mandatory.',
    poster_url: null,
    contact_email: 'events@innopulse360.com',
    contact_phone: '+91-9000000000',
    status: statusByIndex(i),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
});

const tamilNaduColleges = [
  'Anna University',
  'IIT Madras',
  'NIT Trichy',
  'PSG College of Technology',
  'Coimbatore Institute of Technology',
  'SSN College of Engineering',
  'Thiagarajar College of Engineering',
  'SASTRA Deemed University',
  'VIT Chennai',
  'SRM Institute of Science and Technology',
  'Kumaraguru College of Technology',
  'Rajalakshmi Engineering College',
  'Velammal Engineering College',
  'Bannari Amman Institute of Technology',
  'Government College of Technology, Coimbatore'
];

const participants = Array.from({ length: 200 }, (_, i) => {
  const id = i + 1;
  const status = i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'approved' : 'rejected';
  return {
    id,
    student_name: `Student ${id}`,
    college: tamilNaduColleges[i % tamilNaduColleges.length],
    email: `student${id}@example.com`,
    team_name: `Team ${Math.floor(i / 2) + 1}`,
    event_id: (i % events.length) + 1,
    registration_date: new Date(Date.now() - i * 3600 * 1000).toISOString(),
    status,
    rejection_reason: status === 'rejected' ? 'Screening criteria not met' : null
  };
});

const eventManagement = [];
const eventBudget = {};

let nextEventId = events.length + 1;
let nextParticipantId = participants.length + 1;
let nextEventManagementId = 1;

function listEvents({ page = 1, limit = 10, search = '', status = '' }) {
  const q = String(search || '').trim().toLowerCase();
  let rows = [...events];
  if (q) rows = rows.filter((e) => e.event_name.toLowerCase().includes(q) || e.organizer.toLowerCase().includes(q));
  if (status) rows = rows.filter((e) => e.status === status);
  rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const start = (page - 1) * limit;
  const sliced = rows.slice(start, start + limit).map((e) => ({
    ...e,
    registrations_count: participants.filter((p) => p.event_id === e.id).length
  }));
  return { data: sliced, pagination: { page, limit, total: rows.length } };
}

function createEvent(payload) {
  const now = new Date().toISOString();
  const event = {
    id: nextEventId++,
    ...payload,
    max_participants: Number(payload.max_participants || 0),
    round_count: Number(payload.round_count || 1),
    team_size_min: Number(payload.team_size_min || 1),
    team_size_max: Number(payload.team_size_max || 5),
    status: payload.status || 'upcoming',
    registration_fee: payload.registration_fee || 'Free',
    problem_statement: payload.problem_statement || null,
    created_at: now,
    updated_at: now
  };
  events.push(event);
  return event;
}

function updateEvent(id, payload) {
  const idx = events.findIndex((e) => e.id === Number(id));
  if (idx < 0) return null;
  events[idx] = { ...events[idx], ...payload, id: Number(id), updated_at: new Date().toISOString() };
  return events[idx];
}

function deleteEvent(id) {
  const idx = events.findIndex((e) => e.id === Number(id));
  if (idx < 0) return false;
  events.splice(idx, 1);
  return true;
}

function listParticipants({ page = 1, limit = 10, search = '', status = '' }) {
  const q = String(search || '').trim().toLowerCase();
  let rows = participants.map((p) => ({
    ...p,
    event_name: events.find((e) => e.id === p.event_id)?.event_name || 'Unknown Event'
  }));
  if (q) rows = rows.filter((p) => p.student_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
  if (status) rows = rows.filter((p) => p.status === status);
  rows.sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date));
  const start = (page - 1) * limit;
  return { data: rows.slice(start, start + limit), pagination: { page, limit, total: rows.length } };
}

function createParticipant(payload) {
  const row = {
    id: nextParticipantId++,
    student_name: payload.student_name,
    college: payload.college,
    email: payload.email,
    team_name: payload.team_name,
    event_id: Number(payload.event_id),
    registration_date: new Date().toISOString(),
    status: 'pending',
    rejection_reason: null
  };
  participants.push(row);
  return row;
}

function approveParticipant(id) {
  const row = participants.find((p) => p.id === Number(id));
  if (!row) return null;
  row.status = 'approved';
  row.rejection_reason = null;
  return row;
}

function rejectParticipant(id, reason) {
  const row = participants.find((p) => p.id === Number(id));
  if (!row) return null;
  row.status = 'rejected';
  row.rejection_reason = reason;
  return row;
}

function getStats() {
  const total_events = events.length;
  const total_registrations = participants.length;
  const pending_approvals = participants.filter((p) => p.status === 'pending').length;
  const approved_participants = participants.filter((p) => p.status === 'approved').length;
  const active_events = events.filter((e) => e.status === 'active').length;
  const eventVsRegistrations = events.map((e) => ({
    event_name: e.event_name,
    registrations: participants.filter((p) => p.event_id === e.id).length
  }));
  const approvalSplit = ['approved', 'rejected', 'pending'].map((s) => ({
    status: s,
    value: participants.filter((p) => p.status === s).length
  }));
  const byDay = {};
  participants.forEach((p) => {
    const day = new Date(p.registration_date).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  });
  const dailyGrowth = Object.entries(byDay).map(([day, registrations]) => ({ day, registrations }));
  return {
    cards: { total_events, total_registrations, pending_approvals, approved_participants, active_events },
    charts: { eventVsRegistrations, approvalSplit, dailyGrowth }
  };
}

function getFlow(id) {
  const event = events.find((e) => e.id === Number(id));
  if (!event) return null;
  return {
    event,
    flow: [
      { id: '1', label: 'Event Created', date: event.created_at },
      { id: '2', label: 'Registration Open', date: event.registration_start_date || event.created_at },
      { id: '3', label: 'Registration Closed', date: event.registration_deadline },
      { id: '4', label: 'Participant Screening', date: event.screening_date || event.registration_deadline },
      { id: '5', label: 'Approved Participants', date: event.screening_date || event.registration_deadline },
      { id: '6', label: 'Event Start', date: event.start_date },
      { id: '7', label: 'Project Submission', date: event.start_date },
      { id: '8', label: 'Judging', date: event.judging_date || event.end_date },
      { id: '9', label: 'Winner Announcement', date: event.result_date || event.end_date }
    ]
  };
}

function getEventById(id) {
  return events.find((e) => e.id === Number(id)) || null;
}

function parseDesc(input) {
  if (!input) return {};
  if (typeof input === 'object') return input;
  try {
    return JSON.parse(input);
  } catch (e) {
    return { notes: String(input) };
  }
}

function getEventManagementByEvent(eventId) {
  const event = getEventById(eventId);
  if (!event) return null;
  const modules = eventManagement
    .filter((m) => Number(m.event_id) === Number(eventId))
    .map((m) => ({ ...m, description: parseDesc(m.description) }));
  const grouped = {};
  modules.forEach((m) => { grouped[m.category] = m; });
  const totalRegistered = participants.filter((p) => Number(p.event_id) === Number(eventId)).length;
  const accommodation = grouped.accommodation ? grouped.accommodation.description : {};
  const food = grouped.food ? grouped.food.description : {};
  const travel = grouped.travel ? grouped.travel.description : {};
  const registration = grouped.registration ? grouped.registration.description : {};

  const rooms = Number(accommodation.total_rooms_available || 0);
  const perRoom = Number(accommodation.participants_per_room || 0);
  const accommodationCapacity = rooms * perRoom;

  return {
    event,
    modules,
    summary: {
      total_registered_participants: totalRegistered,
      accommodation_capacity: accommodationCapacity,
      food_arrangements_status: food.food_provided ? 'Configured' : 'Pending',
      travel_support_status: travel.travel_support_available ? 'Configured' : 'Pending',
      registration_fee_collection_status: registration.registration_fee_required ? 'Fee Required' : 'Free / Not Configured'
    }
  };
}

function createEventManagement(payload) {
  const row = {
    id: nextEventManagementId++,
    event_id: Number(payload.event_id),
    category: payload.category,
    description: typeof payload.description === 'string' ? payload.description : JSON.stringify(payload.description || {}),
    cost_applicable: !!payload.cost_applicable,
    cost_amount: Number(payload.cost_amount || 0),
    reimbursement_code: payload.reimbursement_code || null,
    payment_qr: payload.payment_qr || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  eventManagement.push(row);
  return row;
}

function updateEventManagement(id, payload) {
  const idx = eventManagement.findIndex((m) => m.id === Number(id));
  if (idx < 0) return null;
  eventManagement[idx] = {
    ...eventManagement[idx],
    ...payload,
    id: Number(id),
    description: typeof payload.description === 'undefined'
      ? eventManagement[idx].description
      : (typeof payload.description === 'string' ? payload.description : JSON.stringify(payload.description || {})),
    updated_at: new Date().toISOString()
  };
  return eventManagement[idx];
}

function deleteEventManagement(id) {
  const idx = eventManagement.findIndex((m) => m.id === Number(id));
  if (idx < 0) return false;
  eventManagement.splice(idx, 1);
  return true;
}

function getBudgetByEvent(eventId) {
  const event = getEventById(eventId);
  if (!event) return null;
  const budget = eventBudget[Number(eventId)] || {
    id: null,
    event_id: Number(eventId),
    accommodation_cost: 0,
    food_cost: 0,
    travel_cost: 0,
    registration_revenue: 0,
    total_budget: 0
  };
  return budget;
}

function upsertBudget(payload) {
  const eventId = Number(payload.event_id);
  const row = {
    id: eventBudget[eventId]?.id || eventId,
    event_id: eventId,
    accommodation_cost: Number(payload.accommodation_cost || 0),
    food_cost: Number(payload.food_cost || 0),
    travel_cost: Number(payload.travel_cost || 0),
    registration_revenue: Number(payload.registration_revenue || 0),
    total_budget: Number(payload.total_budget || 0),
    updated_at: new Date().toISOString(),
    created_at: eventBudget[eventId]?.created_at || new Date().toISOString()
  };
  eventBudget[eventId] = row;
  return row;
}

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  listParticipants,
  createParticipant,
  approveParticipant,
  rejectParticipant,
  getStats,
  getFlow,
  getEventManagementByEvent,
  createEventManagement,
  updateEventManagement,
  deleteEventManagement,
  getBudgetByEvent,
  upsertBudget
};

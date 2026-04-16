function pick(arr, idx) {
  return arr[idx % arr.length];
}

const domains = ['AI', 'IoT', 'HealthTech', 'FinTech', 'EdTech', 'Cybersecurity'];
const departments = ['CSE', 'ECE', 'EEE', 'MECH', 'IT', 'CIVIL'];
const priorities = ['low', 'medium', 'high'];
const tamilNaduColleges = [
  'Anna University',
  'IIT Madras',
  'NIT Trichy',
  'PSG College of Technology',
  'Coimbatore Institute of Technology',
  'Sri Krishna College of Engineering and Technology',
  'SSN College of Engineering',
  'Thiagarajar College of Engineering',
  'SASTRA Deemed University',
  'VIT Chennai',
  'SRM Institute of Science and Technology',
  'Kumaraguru College of Technology',
  'Rajalakshmi Engineering College',
  'Velammal Engineering College',
  'Amrita School of Engineering, Coimbatore',
  'Loyola-ICAM College of Engineering and Technology',
  'St. Joseph’s College of Engineering',
  'Hindustan Institute of Technology & Science',
  'Bannari Amman Institute of Technology',
  'Government College of Technology, Coimbatore',
  'College of Engineering, Guindy',
  'Panimalar Engineering College',
  'Dr. MGR Educational & Research Institute',
  'Jeppiaar Engineering College',
  'Kongu Engineering College',
  'Vel Tech Rangarajan Dr. Sagunthala R&D Institute',
  'Madras Institute of Technology',
  'PSNA College of Engineering and Technology',
  'Saveetha Engineering College',
  'Chennai Institute of Technology'
];
const indianFirstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Vihaan', 'Reyansh', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv',
  'Ananya', 'Aadhya', 'Aarohi', 'Anika', 'Ishita', 'Kavya', 'Meera', 'Priya', 'Riya', 'Diya',
  'Harini', 'Keerthi', 'Nandhini', 'Sanjana', 'Swathi', 'Gayathri', 'Shreya', 'Varsha', 'Sahana', 'Sneha',
  'Karthik', 'Dinesh', 'Pranav', 'Vikram', 'Siddharth', 'Rahul', 'Rohit', 'Suresh', 'Lokesh', 'Vishnu',
  'Naveen', 'Manoj', 'Aravind', 'Arul', 'Bala', 'Surya', 'Vignesh', 'Ganesh', 'Kishore', 'Mohan',
  'Divya', 'Lakshmi', 'Pavithra', 'Priyanka', 'Keerthana', 'Janani', 'Aishwarya', 'Nila', 'Sowmya', 'Deepa'
];
const indianLastNames = [
  'Iyer', 'Nair', 'Reddy', 'Sharma', 'Kumar', 'Raj', 'Pillai', 'Menon', 'Singh', 'Chandra',
  'Venkatesh', 'Raman', 'Gopal', 'Bose', 'Srinivasan', 'Krishnan', 'Subramanian', 'Das', 'Jain', 'Verma'
];

const events = Array.from({ length: 50 }, (_, i) => {
  const id = i + 1;
  const start = new Date(2026, 2, 1 + i);
  const end = new Date(start);
  end.setDate(start.getDate() + 2);
  const regOpen = new Date(start);
  regOpen.setDate(start.getDate() - 10);
  const screening = new Date(start);
  screening.setDate(start.getDate() - 1);
  const judging = new Date(end);
  judging.setDate(end.getDate() + 1);
  const result = new Date(end);
  result.setDate(end.getDate() + 2);
  return {
    id,
    event_id: `EVT-2026-${String(id).padStart(3, '0')}`,
    event_name: `Innovation Sprint ${id}`,
    description: `Challenge focused on ${pick(domains, i)} innovation.`,
    rules: 'Original work only. Final demo mandatory.',
    organizer: 'InnoPulse 360',
    venue: i % 2 ? 'Main Auditorium' : 'Online Platform',
    registration_status: i < 5 ? 'closed' : 'open',
    status: i < 5 ? 'completed' : 'upcoming',
    registration_fee: i % 3 ? 300 : 0,
    prize_details: `Winner INR ${50000 + i * 1000}`,
    problem_statement: `Build a practical ${pick(domains, i)} solution for campus and society.`,
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    registration_start_date: regOpen.toISOString(),
    registration_deadline: new Date(start.getTime() - 2 * 24 * 3600 * 1000).toISOString(),
    screening_date: screening.toISOString(),
    judging_date: judging.toISOString(),
    result_date: result.toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
});

const participants = Array.from({ length: 200 }, (_, i) => {
  const id = i + 1;
  const first = pick(indianFirstNames, i);
  const last = pick(indianLastNames, i + 7);
  const college = pick(tamilNaduColleges, i);
  const now = new Date(2026, 2, 1);
  now.setDate(now.getDate() + (i % 60));
  const created = new Date(now);
  return {
    id,
    participant_id: `PRT-${String(id).padStart(4, '0')}`,
    student_name: `${first} ${last}`,
    college_name: college,
    department: pick(departments, i),
    year: `${(i % 4) + 1}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${id}@example.com`,
    phone: `9${String(100000000 + i).slice(0, 9)}`,
    team_name: `Team ${Math.floor(i / 3) + 1}`,
    team_members: `Member A, Member B`,
    event_id: (i % 50) + 1,
    registration_id: `REG-${String(id).padStart(5, '0')}`,
    status: pick(['pending', 'approved', 'rejected'], i),
    created_at: created.toISOString(),
    updated_at: created.toISOString()
  };
});

participants.push({
  id: 201,
  participant_id: 'PRT-0201',
  student_name: 'Participant User',
  college_name: 'Anna University',
  department: 'CSE',
  year: '3',
  email: 'participant@test.com',
  phone: '9000000201',
  team_name: 'Team InnoPulse',
  team_members: 'Member A, Member B',
  event_id: 1,
  registration_id: 'REG-00201',
  status: 'approved',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

const eventRequests = Array.from({ length: 200 }, (_, i) => {
  const id = i + 1;
  const type = pick(['accommodation', 'food', 'travel'], i);
  const status = pick(['pending', 'approved', 'rejected'], i + 1);
  return {
    id,
    event_id: (i % 50) + 1,
    participant_id: ((i % 200) + 1),
    type,
    details: `${type} request details ${id}`,
    status,
    reimbursement_code: status === 'approved' ? `RMB-${String(id).padStart(5, '0')}` : null,
    rejection_reason: status === 'rejected' ? 'Capacity exceeded' : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
});

const reimbursements = Array.from({ length: 120 }, (_, i) => ({
  id: i + 1,
  event_id: (i % 50) + 1,
  participant_id: (i % 200) + 1,
  reimbursement_code: `RMB-${String(i + 1).padStart(5, '0')}`,
  travel_bills: 500 + i * 10,
  accommodation_bills: 700 + i * 15,
  food_bills: 200 + i * 5,
  receipts_url: 'https://example.com/receipt.pdf',
  payment_proof_url: 'https://example.com/proof.png',
  status: pick(['pending', 'approved', 'rejected'], i),
  remarks: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

const odRequests = Array.from({ length: 120 }, (_, i) => ({
  id: i + 1,
  event_id: (i % 50) + 1,
  participant_id: (i % 200) + 1,
  event_code: `EVT-2026-${String((i % 50) + 1).padStart(3, '0')}`,
  mentor_name: `Mentor ${(i % 10) + 1}`,
  mentor_email: `mentor${(i % 10) + 1}@example.com`,
  parent_email: `parent${(i % 200) + 1}@example.com`,
  status: pick(['pending', 'approved', 'rejected'], i),
  parent_notified: i % 2 === 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

const rewards = Array.from({ length: 120 }, (_, i) => ({
  id: i + 1,
  event_id: (i % 50) + 1,
  participant_id: (i % 200) + 1,
  event_name: `Innovation Sprint ${(i % 50) + 1}`,
  result_type: pick(['Participated', 'Winner', 'Runner-up'], i),
  certificate_url: 'https://example.com/cert.pdf',
  proof_url: 'https://example.com/proof.png',
  status: pick(['pending', 'approved', 'rejected'], i + 2),
  reward_points: i % 3 === 1 ? 50 : 10,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

const feedbackQuestions = [
  'Q1: How clear were the event announcement and eligibility criteria?',
  'Q2: How easy was the event registration process?',
  'Q3: How helpful was the event communication before the hackathon?',
  'Q4: How satisfied are you with the registration confirmation and updates?',
  'Q5: How relevant was the problem statement to real-world challenges?',
  'Q6: How clear were the rules, timeline, and submission requirements?',
  'Q7: How user-friendly was the event portal and navigation experience?',
  'Q8: How satisfied are you with the event schedule and time management?',
  'Q9: Rate the quality of accommodation support provided.',
  'Q10: Rate the hygiene and quality of food arrangements.',
  'Q11: Rate the punctuality and convenience of travel support.',
  'Q12: How fair was the reimbursement and support process?',
  'Q13: How responsive was the event management team to your requests?',
  'Q14: How effective was mentor guidance during the event?',
  'Q15: How timely was OD/permission approval communication?',
  'Q16: How useful were mentor interactions for improving your idea?',
  'Q17: How fair and transparent was the shortlisting process?',
  'Q18: How fair and professional was the jury evaluation process?',
  'Q19: How clear was the judging rubric and scoring criteria?',
  'Q20: How satisfied are you with the demo/presentation review process?',
  'Q21: How well did the event support teamwork and collaboration?',
  'Q22: How satisfied are you with the technical infrastructure (internet, venue, tools)?',
  'Q23: How well did the event improve your innovation and problem-solving skills?',
  'Q24: How confident are you about applying what you learned after this event?',
  'Q25: How satisfied are you with winner/reward declaration transparency?',
  'Q26: How smooth was the certificate/reward claim process?',
  'Q27: How likely are you to participate in future events by this organizer?',
  'Q28: How likely are you to recommend this event to your peers?',
  'Q29: Overall, how satisfied are you with the complete event experience?',
  'Q30: How strongly do you agree that this event delivered value for your time and effort?'
];
const feedbackForms = events.map((e) => ({
  id: e.id,
  event_id: e.id,
  questions: feedbackQuestions
}));
const feedback = Array.from({ length: 200 }, (_, i) => {
  const answers = {};
  feedbackQuestions.forEach((q, idx) => { answers[`q${idx + 1}`] = ((i + idx) % 5) + 1; });
  return {
    id: i + 1,
    event_id: (i % 50) + 1,
    participant_id: (i % 200) + 1,
    answers,
    overall_satisfaction: ((i % 5) + 1),
    suggestion: `Suggestion ${i + 1}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
});

const queries = Array.from({ length: 120 }, (_, i) => ({
  id: i + 1,
  event_id: (i % 50) + 1,
  participant_id: (i % 200) + 1,
  category: pick(['Query', 'Complaint', 'Suggestion'], i),
  description: `Issue description ${i + 1}`,
  priority: pick(priorities, i),
  status: pick(['open', 'answered', 'closed'], i),
  response: i % 2 ? `Response for query ${i + 1}` : '',
  responder_role: i % 2 ? pick(['event_management', 'college_management'], i) : '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

let regSeq = participants.length + 1;
let requestSeq = eventRequests.length + 1;
let reimbursementSeq = reimbursements.length + 1;
let odSeq = odRequests.length + 1;
let rewardSeq = rewards.length + 1;
let feedbackSeq = feedback.length + 1;
let querySeq = queries.length + 1;

function listEvents(params = {}) {
  const q = String(params.search || '').toLowerCase().trim();
  const status = String(params.status || '').trim();
  let rows = [...events];
  if (q) rows = rows.filter((e) => e.event_name.toLowerCase().includes(q) || e.event_id.toLowerCase().includes(q));
  if (status) rows = rows.filter((e) => e.status === status || e.registration_status === status);
  return rows;
}

function getEventDetails(eventId) {
  const event = events.find((e) => Number(e.id) === Number(eventId));
  if (!event) return null;
  const flow = [
    { label: 'Event Created', date: event.created_at },
    { label: 'Registration Open', date: event.registration_start_date || event.created_at },
    { label: 'Registration Closed', date: event.registration_deadline },
    { label: 'Participant Approval', date: event.screening_date || event.registration_deadline },
    { label: 'Hackathon Start', date: event.start_date },
    { label: 'Submission', date: event.end_date || event.start_date },
    { label: 'Judging', date: event.judging_date || event.end_date },
    { label: 'Winner Announcement', date: event.result_date || event.end_date }
  ].map((step, i) => ({ id: String(i + 1), ...step }));
  return { event, flow };
}

function registerParticipant(payload) {
  const id = regSeq++;
  const row = {
    id,
    participant_id: `PRT-${String(id).padStart(4, '0')}`,
    student_name: payload.student_name,
    college_name: payload.college_name,
    department: payload.department,
    year: payload.year,
    email: payload.email,
    phone: payload.phone,
    team_name: payload.team_name,
    team_members: payload.team_members,
    event_id: Number(payload.event_id),
    registration_id: `REG-${String(id).padStart(5, '0')}`,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  participants.push(row);
  return row;
}

function getRegistrationsByEmail(email) {
  const userRows = participants.filter((p) => p.email === email);
  return userRows.map((p) => ({ ...p, event: events.find((e) => e.id === p.event_id) || null }));
}

function getLogistics(eventId) {
  const event = events.find((e) => e.id === Number(eventId));
  if (!event) return null;
  return {
    event_id: event.id,
    accommodation: { type: 'Hostel', location: 'Block A', status: 'available' },
    food: { meals: ['Breakfast', 'Lunch', 'Dinner'], vendor: 'Campus Kitchen', status: 'configured' },
    travel: { transport: 'Bus', pickup: 'Main Gate', status: 'available' },
    registration_fee_qr: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${event.event_name}-${event.registration_fee}`)}`
  };
}

function createEventRequest(payload) {
  const id = requestSeq++;
  const row = {
    id,
    event_id: Number(payload.event_id),
    participant_id: Number(payload.participant_id),
    type: payload.type,
    details: payload.details || '',
    status: 'pending',
    reimbursement_code: null,
    rejection_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  eventRequests.push(row);
  return row;
}

function listEventRequests(params = {}) {
  let rows = [...eventRequests];
  if (params.type) rows = rows.filter((r) => r.type === params.type);
  if (params.status) rows = rows.filter((r) => r.status === params.status);
  if (params.participant_id) rows = rows.filter((r) => Number(r.participant_id) === Number(params.participant_id));
  return rows.map((r) => ({
    ...r,
    event: events.find((e) => e.id === r.event_id) || null,
    participant: participants.find((p) => p.id === r.participant_id) || null
  }));
}

function updateEventRequest(id, payload) {
  const idx = eventRequests.findIndex((r) => r.id === Number(id));
  if (idx < 0) return null;
  const cur = eventRequests[idx];
  const next = {
    ...cur,
    ...payload,
    reimbursement_code: payload.status === 'approved' ? (payload.reimbursement_code || `RMB-${String(cur.id).padStart(5, '0')}`) : cur.reimbursement_code,
    updated_at: new Date().toISOString()
  };
  eventRequests[idx] = next;
  return next;
}

function createReimbursement(payload) {
  const id = reimbursementSeq++;
  const row = { id, ...payload, status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  reimbursements.push(row);
  return row;
}

function listReimbursements(params = {}) {
  let rows = [...reimbursements];
  if (params.status) rows = rows.filter((r) => r.status === params.status);
  if (params.participant_id) rows = rows.filter((r) => Number(r.participant_id) === Number(params.participant_id));
  return rows;
}

function updateReimbursement(id, payload) {
  const idx = reimbursements.findIndex((r) => r.id === Number(id));
  if (idx < 0) return null;
  reimbursements[idx] = { ...reimbursements[idx], ...payload, updated_at: new Date().toISOString() };
  return reimbursements[idx];
}

function createOdRequest(payload) {
  const id = odSeq++;
  const row = { id, ...payload, status: 'pending', parent_notified: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  odRequests.push(row);
  return row;
}

function listOdRequests(params = {}) {
  let rows = [...odRequests];
  if (params.status) rows = rows.filter((r) => r.status === params.status);
  if (params.mentor_email) rows = rows.filter((r) => r.mentor_email === params.mentor_email);
  if (params.participant_id) rows = rows.filter((r) => Number(r.participant_id) === Number(params.participant_id));
  return rows;
}

function updateOdRequest(id, payload) {
  const idx = odRequests.findIndex((r) => r.id === Number(id));
  if (idx < 0) return null;
  odRequests[idx] = { ...odRequests[idx], ...payload, updated_at: new Date().toISOString() };
  return odRequests[idx];
}

function createReward(payload) {
  const id = rewardSeq++;
  const row = { id, ...payload, status: 'pending', reward_points: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  rewards.push(row);
  return row;
}

function listRewards(params = {}) {
  let rows = [...rewards];
  if (params.status) rows = rows.filter((r) => r.status === params.status);
  if (params.participant_id) rows = rows.filter((r) => Number(r.participant_id) === Number(params.participant_id));
  return rows;
}

function updateReward(id, payload) {
  const idx = rewards.findIndex((r) => r.id === Number(id));
  if (idx < 0) return null;
  rewards[idx] = { ...rewards[idx], ...payload, updated_at: new Date().toISOString() };
  return rewards[idx];
}

function createFeedback(payload) {
  const eventId = Number(payload.event_id);
  const participantId = Number(payload.participant_id);
  const event = events.find((e) => e.id === eventId);
  if (!event) return { error: 'Event not found', status: 404 };

  const registration = participants.find((p) => Number(p.id) === participantId && Number(p.event_id) === eventId);
  if (!registration) return { error: 'You can submit feedback only for your registered event.', status: 422 };

  const isCompleted = event.status === 'completed' || (event.end_date && new Date(event.end_date) < new Date());
  if (!isCompleted) return { error: 'Feedback can be submitted only after event completion.', status: 422 };

  const duplicate = feedback.find((f) => Number(f.event_id) === eventId && Number(f.participant_id) === participantId);
  if (duplicate) return { error: 'Feedback already submitted for this event.', status: 409 };

  const form = feedbackForms.find((f) => Number(f.event_id) === eventId);
  const requiredCount = form ? form.questions.length : 20;
  if (Object.keys(payload.answers || {}).length < requiredCount) {
    return { error: `Minimum ${requiredCount} feedback answers are required`, status: 422 };
  }

  const id = feedbackSeq++;
  const row = {
    id,
    ...payload,
    event_id: eventId,
    participant_id: participantId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  feedback.push(row);
  return row;
}

function listFeedbackForms() {
  return feedbackForms;
}

function saveFeedbackForm(payload) {
  const eventId = Number(payload.event_id);
  const questions = Array.isArray(payload.questions) ? payload.questions : [];
  if (!eventId || questions.length < 5) return null;
  const existing = feedbackForms.find((f) => Number(f.event_id) === eventId);
  if (existing) {
    existing.questions = questions;
    return existing;
  }
  const row = { id: feedbackForms.length + 1, event_id: eventId, questions };
  feedbackForms.push(row);
  return row;
}

function listFeedback() {
  return feedback;
}

function getFeedbackByEmail(email) {
  const pIds = participants.filter((p) => p.email === email).map((p) => Number(p.id));
  return feedback
    .filter((f) => pIds.includes(Number(f.participant_id)))
    .map((f) => ({
      ...f,
      event: events.find((e) => Number(e.id) === Number(f.event_id)) || null
    }));
}

function getFeedbackAnalytics() {
  const metrics = {
    satisfaction: 0,
    food: 0,
    travel: 0,
    quality: 0
  };
  feedback.forEach((f) => {
    metrics.satisfaction += Number(f.answers?.q1 || 0);
    metrics.food += Number(f.answers?.q8 || 0);
    metrics.travel += Number(f.answers?.q12 || 0);
    metrics.quality += Number(f.answers?.q20 || 0);
  });
  const count = feedback.length || 1;
  Object.keys(metrics).forEach((k) => { metrics[k] = Number((metrics[k] / count).toFixed(2)); });
  const byDept = departments.map((d, i) => ({ department: d, participants: participants.filter((p) => p.department === d).length, wins: rewards.filter((r) => r.result_type === 'Winner' && ((r.participant_id - 1) % departments.length) === i).length }));
  return {
    kpi: metrics,
    satisfactionTrend: feedback.slice(0, 30).map((f, i) => ({ day: `D${i + 1}`, score: Number(f.overall_satisfaction || 0) })),
    byDepartment: byDept
  };
}

function createQuery(payload) {
  const id = querySeq++;
  const row = { id, ...payload, status: 'open', response: '', responder_role: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  queries.push(row);
  return row;
}

function listQueries(params = {}) {
  let rows = [...queries];
  if (params.status) rows = rows.filter((q) => q.status === params.status);
  if (params.participant_id) rows = rows.filter((q) => Number(q.participant_id) === Number(params.participant_id));
  return rows;
}

function replyQuery(id, payload) {
  const idx = queries.findIndex((q) => q.id === Number(id));
  if (idx < 0) return null;
  queries[idx] = { ...queries[idx], response: payload.response, responder_role: payload.responder_role, status: 'answered', updated_at: new Date().toISOString() };
  return queries[idx];
}

function adminRaw(table) {
  const map = {
    events,
    participants,
    event_requests: eventRequests,
    reimbursements,
    od_requests: odRequests,
    rewards,
    feedback,
    queries
  };
  return map[table] || [];
}

function adminUpdate(table, id, payload) {
  const rows = adminRaw(table);
  const idx = rows.findIndex((r) => Number(r.id) === Number(id));
  if (idx < 0) return null;
  rows[idx] = { ...rows[idx], ...payload, updated_at: new Date().toISOString() };
  return rows[idx];
}

function adminDelete(table, id) {
  const rows = adminRaw(table);
  const idx = rows.findIndex((r) => Number(r.id) === Number(id));
  if (idx < 0) return false;
  rows.splice(idx, 1);
  return true;
}

module.exports = {
  feedbackQuestions,
  listFeedbackForms,
  saveFeedbackForm,
  listFeedback,
  listEvents,
  getEventDetails,
  registerParticipant,
  getRegistrationsByEmail,
  getLogistics,
  createEventRequest,
  listEventRequests,
  updateEventRequest,
  createReimbursement,
  listReimbursements,
  updateReimbursement,
  createOdRequest,
  listOdRequests,
  updateOdRequest,
  createReward,
  listRewards,
  updateReward,
  createFeedback,
  getFeedbackByEmail,
  getFeedbackAnalytics,
  createQuery,
  listQueries,
  replyQuery,
  adminRaw,
  adminUpdate,
  adminDelete
};

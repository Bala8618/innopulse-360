require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');
const Team = require('../models/Team');
const Registration = require('../models/Registration');
const MentorApproval = require('../models/MentorApproval');
const TravelRequest = require('../models/TravelRequest');
const Accommodation = require('../models/Accommodation');
const FoodPlan = require('../models/FoodPlan');
const PerformanceReport = require('../models/PerformanceReport');

async function upsertUser({ name, email, password, role }) {
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    existing.name = name;
    existing.role = role;
    existing.isVerified = true;
    existing.status = 'active';
    existing.password = password;
    await existing.save();
    return existing;
  }

  return User.create({
    name,
    email: normalizedEmail,
    password,
    role,
    isVerified: true,
    status: 'active'
  });
}

async function upsertEvent(payload) {
  const existing = await Event.findOne({ slug: payload.slug });
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }
  return Event.create(payload);
}

async function seed() {
  await connectDB();

  const credentials = {
    admin: { email: process.env.SEED_ADMIN_EMAIL || 'admin@test.com', password: process.env.SEED_ADMIN_PASSWORD || 'Bala@0301' },
    participant: { email: process.env.SEED_PARTICIPANT_EMAIL || 'participant@test.com', password: process.env.SEED_PARTICIPANT_PASSWORD || 'Bala@0301' },
    mentor: { email: process.env.SEED_MENTOR_EMAIL || 'mentor@test.com', password: process.env.SEED_MENTOR_PASSWORD || 'Bala@0301' },
    eventTeam: { email: process.env.SEED_EVENT_TEAM_EMAIL || 'event@test.com', password: process.env.SEED_EVENT_TEAM_PASSWORD || 'Bala@0301' },
    collegeTeam: { email: process.env.SEED_COLLEGE_TEAM_EMAIL || 'college@test.com', password: process.env.SEED_COLLEGE_TEAM_PASSWORD || 'Bala@0301' },
    reportsTeam: { email: process.env.SEED_REPORTS_TEAM_EMAIL || 'reports@test.com', password: process.env.SEED_REPORTS_TEAM_PASSWORD || 'Bala@0301' }
  };

  const [admin, eventTeam, collegeTeam, reportsTeam, mentor, participant] = await Promise.all([
    upsertUser({ name: 'Platform Admin', email: credentials.admin.email, password: credentials.admin.password, role: 'admin' }),
    upsertUser({ name: 'Event Management Team', email: credentials.eventTeam.email, password: credentials.eventTeam.password, role: 'event_management' }),
    upsertUser({ name: 'College Management Team', email: credentials.collegeTeam.email, password: credentials.collegeTeam.password, role: 'college_management' }),
    upsertUser({ name: 'Reports Team', email: credentials.reportsTeam.email, password: credentials.reportsTeam.password, role: 'reports_team' }),
    upsertUser({ name: 'Lead Mentor', email: credentials.mentor.email, password: credentials.mentor.password, role: 'mentor' }),
    upsertUser({ name: 'Demo Participant', email: credentials.participant.email, password: credentials.participant.password, role: 'participant' })
  ]);

  const liveEvent = await upsertEvent({
    title: 'InnoPulse Campus Hackathon 2026',
    slug: 'innopulse-campus-hackathon-2026',
    organizer: 'InnoPulse 360',
    description: 'Commercial demo event with live registration and operations.',
    eventType: 'team',
    minTeamSize: 1,
    maxTeamSize: 5,
    prizePool: 100000,
    prizeDetails: 'Winner 60K, Runner-up 30K, Special Prize 10K',
    workflowNotes: 'Registration -> Mentor Approval -> Logistics -> Evaluation -> Winner',
    registrationStartDate: new Date('2026-03-01'),
    registrationDeadline: new Date('2026-03-20'),
    startDate: new Date('2026-03-25'),
    endDate: new Date('2026-03-30'),
    rounds: [
      { name: 'Idea Screening', startDate: new Date('2026-03-25'), endDate: new Date('2026-03-26'), notes: 'Screening round' },
      { name: 'Final Demo', startDate: new Date('2026-03-28'), endDate: new Date('2026-03-29'), notes: 'Final presentation' }
    ],
    status: 'open',
    domains: ['AI', 'EdTech', 'HealthTech']
  });

  const completedEvent = await upsertEvent({
    title: 'InnoPulse Innovation Sprint 2025',
    slug: 'innopulse-innovation-sprint-2025',
    organizer: 'InnoPulse 360',
    description: 'Completed event for report and feedback analytics.',
    eventType: 'individual',
    minTeamSize: 1,
    maxTeamSize: 1,
    prizePool: 50000,
    prizeDetails: 'Winner 30K, Runner-up 20K',
    workflowNotes: 'Completed cycle with feedback collection.',
    registrationStartDate: new Date('2025-10-01'),
    registrationDeadline: new Date('2025-10-15'),
    startDate: new Date('2025-10-20'),
    endDate: new Date('2025-10-25'),
    rounds: [
      { name: 'Submission Review', startDate: new Date('2025-10-20'), endDate: new Date('2025-10-21') },
      { name: 'Final Review', startDate: new Date('2025-10-23'), endDate: new Date('2025-10-24') }
    ],
    status: 'completed',
    domains: ['FinTech', 'GovTech']
  });

  const team = await Team.findOneAndUpdate(
    { name: 'AI Team Alpha', event: liveEvent._id },
    {
      name: 'AI Team Alpha',
      event: liveEvent._id,
      domain: 'AI',
      members: [participant._id],
      mentor: mentor._id,
      status: 'active'
    },
    { upsert: true, new: true, runValidators: true }
  );

  await Registration.findOneAndUpdate(
    { event: liveEvent._id, user: participant._id },
    {
      event: liveEvent._id,
      user: participant._id,
      team: team._id,
      ideaTitle: 'AI Attendance Optimizer',
      ideaSummary: 'Predictive model for smart attendance and intervention.',
      domain: 'AI',
      teamPreferenceName: 'Team Alpha',
      teamMembersInput: ['participant@innopulse360.com'],
      status: 'approved'
    },
    { upsert: true, new: true, runValidators: true }
  );

  await Registration.findOneAndUpdate(
    { event: completedEvent._id, user: participant._id },
    {
      event: completedEvent._id,
      user: participant._id,
      team: team._id,
      ideaTitle: 'Inclusive Payments Gateway',
      ideaSummary: 'Financial accessibility platform for students.',
      domain: 'FinTech',
      status: 'approved'
    },
    { upsert: true, new: true, runValidators: true }
  );

  await MentorApproval.findOneAndUpdate(
    { event: liveEvent._id, user: participant._id, mentor: mentor._id, requestType: 'mentor-approval' },
    {
      event: liveEvent._id,
      user: participant._id,
      team: team._id,
      mentor: mentor._id,
      requestType: 'mentor-approval',
      reason: 'Requesting approval for institutional OD and participation.',
      proofUrl: 'https://example.com/od-request-proof',
      status: 'approved',
      reviewRemark: 'Approved for event participation and OD.',
      reviewedAt: new Date(),
      reviewedBy: mentor._id
    },
    { upsert: true, new: true, runValidators: true }
  );

  await TravelRequest.findOneAndUpdate(
    { event: liveEvent._id, user: participant._id },
    {
      event: liveEvent._id,
      user: participant._id,
      team: team._id,
      sourceCity: 'Erode',
      destinationCity: 'Chennai',
      mode: 'train',
      amount: 900,
      isFree: false,
      costConfigured: 750,
      managementRemark: 'Partially reimbursed by program.',
      status: 'approved',
      approvedBy: eventTeam._id
    },
    { upsert: true, new: true, runValidators: true }
  );

  await Accommodation.findOneAndUpdate(
    { event: liveEvent._id, user: participant._id },
    {
      event: liveEvent._id,
      user: participant._id,
      team: team._id,
      hotelName: 'Innovation Residency',
      checkIn: new Date('2026-03-24'),
      checkOut: new Date('2026-03-30'),
      roomType: 'double',
      isFree: true,
      costConfigured: 0,
      managementRemark: 'Sponsored accommodation',
      status: 'allocated'
    },
    { upsert: true, new: true, runValidators: true }
  );

  await FoodPlan.findOneAndUpdate(
    { event: liveEvent._id, user: participant._id },
    {
      event: liveEvent._id,
      user: participant._id,
      team: team._id,
      preference: 'veg',
      allergies: ['peanut'],
      mealSlots: ['breakfast', 'lunch', 'dinner'],
      isFree: true,
      costConfigured: 0,
      managementRemark: 'Event meal pass active',
      status: 'approved'
    },
    { upsert: true, new: true, runValidators: true }
  );

  await PerformanceReport.findOneAndUpdate(
    { event: completedEvent._id, user: participant._id },
    {
      event: completedEvent._id,
      user: participant._id,
      team: team._id,
      IPI: 86,
      teamInnovationScore: 84,
      mentorEngagementRate: 0.88,
      juryCompletionRate: 0.91,
      travelHospitalityEfficiency: 0.94,
      eventOperationalEfficiency: 0.91,
      eventRating: 5,
      participantFeedback: 'Excellent event coordination and mentorship support.',
      wouldRecommend: true,
      submittedAt: new Date()
    },
    { upsert: true, new: true, runValidators: true }
  );

  console.log('\nSeed completed successfully.\n');
  console.log('Demo Login Credentials:');
  console.log(`Admin       : ${credentials.admin.email} / ${credentials.admin.password}`);
  console.log(`Event Team  : ${credentials.eventTeam.email} / ${credentials.eventTeam.password}`);
  console.log(`College Team: ${credentials.collegeTeam.email} / ${credentials.collegeTeam.password}`);
  console.log(`Reports Team: ${credentials.reportsTeam.email} / ${credentials.reportsTeam.password}`);
  console.log(`Mentor      : ${credentials.mentor.email} / ${credentials.mentor.password}`);
  console.log(`Participant : ${credentials.participant.email} / ${credentials.participant.password}`);
}

seed()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  });

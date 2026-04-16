export const participantRoutes = [
  { path: '/dashboard/user', label: 'Participant Overview', role: 'participant' },
  { path: '/dashboard/user/profile', label: 'Profile', role: 'participant' },
  { path: '/dashboard/user/team', label: 'Team', role: 'participant' },
  { path: '/dashboard/user/registration-status', label: 'Registration Status', role: 'participant' },
  { path: '/dashboard/user/event-flow', label: 'Event Flow', role: 'participant' },
  { path: '/dashboard/user/shortlist-status', label: 'Shortlist Status', role: 'participant' },
  { path: '/dashboard/user/idea-submission', label: 'Idea Submission', role: 'participant' },
  { path: '/dashboard/user/collaboration', label: 'Collaboration', role: 'participant' },
  { path: '/dashboard/user/travel', label: 'Travel', role: 'participant' },
  { path: '/dashboard/user/accommodation', label: 'Accommodation', role: 'participant' },
  { path: '/dashboard/user/food', label: 'Food', role: 'participant' },
  { path: '/dashboard/user/mentoring', label: 'Mentoring', role: 'participant' },
  { path: '/dashboard/user/activity-points', label: 'Activity Points', role: 'participant' },
  { path: '/dashboard/user/winners', label: 'Winners & Rewards', role: 'participant' },
  { path: '/dashboard/user/prototype-upload', label: 'Prototype Upload', role: 'participant' },
  { path: '/dashboard/user/jury-feedback', label: 'Jury Feedback', role: 'participant' },
  { path: '/dashboard/user/performance', label: 'Performance', role: 'participant' },
  { path: '/dashboard/user/certificates', label: 'Certificates', role: 'participant' },
  { path: '/dashboard/user/support', label: 'Support', role: 'participant' },
  { path: '/dashboard/user/notifications', label: 'Notifications', role: 'participant' }
];

export const mentorRoutes = [
  { path: '/dashboard/mentor', label: 'Mentor Overview', role: 'mentor' },
  { path: '/dashboard/mentor/assigned-teams', label: 'Assigned Teams', role: 'mentor' },
  { path: '/dashboard/mentor/session-logs', label: 'Session Logs', role: 'mentor' },
  { path: '/dashboard/mentor/approvals', label: 'Approval Requests', role: 'mentor' },
  { path: '/dashboard/mentor/feedback', label: 'Feedback', role: 'mentor' },
  { path: '/dashboard/mentor/team-progress', label: 'Team Progress', role: 'mentor' },
  { path: '/dashboard/mentor/performance', label: 'Performance', role: 'mentor' }
];

export const adminRoutes = [
  { path: '/dashboard/admin', label: 'Event Management', role: 'admin' },
  { path: '/dashboard/admin/event-overview', label: 'Event Setup', role: 'admin' },
  { path: '/dashboard/admin/reports', label: 'Feedback Reports', role: 'admin' }
];

export const allDashboardRoutes = [
  ...participantRoutes,
  ...mentorRoutes,
  ...adminRoutes
];

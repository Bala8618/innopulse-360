import { Routes, Route, Navigate } from 'react-router-dom';
import SplashPage from './pages/public/SplashPage';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import FeaturesPage from './pages/public/FeaturesPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import ModulePage from './components/common/ModulePage';
import ErrorBoundary from './components/common/ErrorBoundary';
import SaasLayout from './pages/saas/SaasLayout';
import DashboardPage from './pages/saas/DashboardPage';
import EventCreationPage from './pages/saas/EventCreationPage';
import EventFlowPage from './pages/saas/EventFlowPage';
import ParticipantApprovalPage from './pages/saas/ParticipantApprovalPage';
import EventDetailsPage from './pages/saas/EventDetailsPage';
import PortalLayout from './pages/portal/PortalLayout';
import ParticipantPortal from './pages/portal/ParticipantPortal';
import MentorPortal from './pages/portal/MentorPortal';
import EventManagementPortal from './pages/portal/EventManagementPortal';
import CollegeManagementPortal from './pages/portal/CollegeManagementPortal';
import ReportsTeamPortal from './pages/portal/ReportsTeamPortal';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminControlLayout from './pages/admin/AdminControlLayout';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminLogsPage from './pages/admin/AdminLogsPage';
import AdminDataConsole from './pages/admin/AdminDataConsole';
import {
  participantRoutes,
  mentorRoutes,
  adminRoutes
} from './routes/dashboardRouteMap';

function renderDashboardRoutes(items) {
  return items.map((route) => (
    <Route key={route.path} path={route.path} element={<ModulePage route={route} />} />
  ));
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />

      <Route element={<PublicLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<Navigate to="/admin-innopulse-control" replace />} />
        <Route path="/event-dashboard" element={<Navigate to="/portal/event-management" replace />} />
        <Route path="/participant-dashboard" element={<Navigate to="/portal/participant" replace />} />
        <Route path="/mentor-dashboard" element={<Navigate to="/portal/mentor" replace />} />
        <Route path="/reports-dashboard" element={<Navigate to="/portal/reports-team" replace />} />
        <Route path="/event/create" element={<Navigate to="/saas/event-creation" replace />} />
        <Route path="/event/list" element={<Navigate to="/saas/event-details" replace />} />
        <Route path="/event/flow" element={<Navigate to="/saas/event-flow" replace />} />
        <Route path="/participant-login" element={<Navigate to="/login/participant" replace />} />
        <Route path="/event-team-login" element={<Navigate to="/login/event_management" replace />} />
        <Route path="/mentor-login" element={<Navigate to="/login/mentor" replace />} />
        <Route path="/college-management-login" element={<Navigate to="/login/college_management" replace />} />
        <Route path="/reports-team-login" element={<Navigate to="/login/reports_team" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      <Route path="/saas" element={<ErrorBoundary><SaasLayout /></ErrorBoundary>}>
        <Route index element={<Navigate to="/saas/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="event-creation" element={<EventCreationPage />} />
        <Route path="event-management" element={<Navigate to="/portal/event-management" replace />} />
        <Route path="event-flow" element={<EventFlowPage />} />
        <Route path="event-details" element={<EventDetailsPage />} />
        <Route path="participant-approval" element={<ParticipantApprovalPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['participant', 'mentor', 'admin', 'event_management', 'college_management', 'reports_team']} />}>
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin-innopulse-control" element={<AdminControlLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="registrations" element={<AdminRegistrationsPage />} />
            <Route path="data" element={<AdminDataConsole />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="logs" element={<AdminLogsPage />} />
          </Route>
        </Route>
        <Route path="/portal" element={<PortalLayout />}>
          <Route element={<ProtectedRoute allowedRoles={['participant']} />}>
            <Route path="participant" element={<ParticipantPortal />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['mentor']} />}>
            <Route path="mentor" element={<MentorPortal />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['event_management']} />}>
            <Route path="event-management" element={<EventManagementPortal />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['college_management']} />}>
            <Route path="college-management" element={<CollegeManagementPortal />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['reports_team']} />}>
            <Route path="reports-team" element={<ReportsTeamPortal />} />
          </Route>
        </Route>

        <Route path="/participant-portal" element={<Navigate to="/portal/participant" replace />} />
        <Route path="/event-team-portal" element={<Navigate to="/portal/event-management" replace />} />
        <Route path="/mentor-portal" element={<Navigate to="/portal/mentor" replace />} />
        <Route path="/college-management-portal" element={<Navigate to="/portal/college-management" replace />} />
        <Route path="/reports-team-portal" element={<Navigate to="/portal/reports-team" replace />} />

        <Route element={<DashboardLayout />}>
          <Route element={<ProtectedRoute allowedRoles={['participant']} />}>
            {renderDashboardRoutes(participantRoutes)}
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['mentor']} />}>
            {renderDashboardRoutes(mentorRoutes)}
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            {renderDashboardRoutes(adminRoutes)}
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

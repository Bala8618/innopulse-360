import { Navigate, Outlet, useLocation } from 'react-router-dom';

function getUser() {
  const raw = localStorage.getItem('innopulse_user');
  return raw ? JSON.parse(raw) : null;
}

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const user = getUser();
  const homeByRole = {
    participant: '/portal/participant',
    mentor: '/portal/mentor',
    admin: '/admin-innopulse-control',
    event_management: '/portal/event-management',
    college_management: '/portal/college-management',
    reports_team: '/portal/reports-team'
  };

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={homeByRole[user.role] || '/home'} replace />;
  }

  return <Outlet />;
}
